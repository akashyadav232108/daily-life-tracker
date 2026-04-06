package com.tracker.expense.service;

import com.tracker.expense.exception.ExpenseNotFoundException;
import com.tracker.expense.kafka.producer.ExpenseEventProducer;
import com.tracker.expense.model.dto.request.ExpenseRequest;
import com.tracker.expense.model.dto.response.ExpenseResponse;
import com.tracker.expense.model.dto.response.MonthlyBreakdownResponse;
import com.tracker.expense.model.entity.Expense;
import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.TransactionType;
import com.tracker.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ExpenseRepository expenseRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ExpenseEventProducer eventProducer;
    private final BudgetService budgetService;

    // ─── Redis Key Helper ─────────────────────────────────────────

    /**
     * Key pattern: expense:monthly:{userId}:{monthYear}:{category}
     * e.g.        expense:monthly:42:2026-04:FOOD
     */
    private String redisKey(Long userId, String monthYear, Category category) {
        return "expense:monthly:" + userId + ":" + monthYear + ":" + category.name();
    }

    /**
     * Seconds until end of the current month — used as Redis TTL.
     */
    private long secondsUntilEndOfMonth() {
        LocalDate today = LocalDate.now();
        LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        return Duration.between(
                today.atStartOfDay(),
                lastDay.plusDays(1).atStartOfDay()
        ).getSeconds();
    }

    // ─── CRUD ─────────────────────────────────────────────────────

    @Transactional
    public ExpenseResponse addExpense(Long userId, String userEmail, ExpenseRequest request) {
        Expense expense = Expense.builder()
                .userId(userId)
                .type(request.getType())
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .paymentMethod(request.getPaymentMethod())
                .expenseDate(request.getExpenseDate())
                .build();

        expense = expenseRepository.save(expense);
        log.debug("Saved expense id={} for userId={}", expense.getId(), userId);

        // ── Redis: increment monthly total (only for EXPENSE type) ──
        if (request.getType() == TransactionType.EXPENSE) {
            String monthYear = request.getExpenseDate().format(MONTH_FORMATTER);
            String key = redisKey(userId, monthYear, request.getCategory());

            redisTemplate.opsForValue().increment(key, 0); // ensure key exists
            Double newTotal = redisTemplate.opsForValue()
                    .increment(key, request.getAmount().doubleValue());
            // Set TTL only if this is the first time we're setting this key
            if (newTotal != null && newTotal.equals(request.getAmount().doubleValue())) {
                redisTemplate.expire(key, Duration.ofSeconds(secondsUntilEndOfMonth()));
            }
            log.debug("Redis INCR key={} → newTotal={}", key, newTotal);

            // ── Budget threshold check ──
            if (newTotal != null) {
                budgetService.checkAndPublishBudgetAlert(userId, userEmail, request.getCategory(),
                        monthYear, BigDecimal.valueOf(newTotal), expense.getId());
            }
        }

        // ── Kafka: publish EXPENSE_ADDED event ──
        eventProducer.publishExpenseAdded(userId, expense.getId(), expense.getAmount(), expense.getCategory());

        return toResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Long userId, LocalDate from, LocalDate to,
                                              TransactionType type, Category category,
                                              String view) {
        // Resolve shortcut "view" param into date range
        LocalDate[] range = resolveDateRange(from, to, view);
        return expenseRepository
                .findByUserIdWithFilters(userId, range[0], range[1], type, category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));

        if (!expense.getUserId().equals(userId)) {
            throw new ExpenseNotFoundException(expenseId); // hide existence from other users
        }
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));

        if (!expense.getUserId().equals(userId)) {
            throw new ExpenseNotFoundException(expenseId);
        }

        // ── Redis: if EXPENSE type changed amount/category, adjust cached totals ──
        adjustRedisOnUpdate(userId, expense, request);

        // Update fields
        expense.setType(request.getType());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setExpenseDate(request.getExpenseDate());

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    @Transactional
    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));

        if (!expense.getUserId().equals(userId)) {
            throw new ExpenseNotFoundException(expenseId);
        }

        // ── Redis: decrement monthly total if it was an EXPENSE ──
        if (expense.getType() == TransactionType.EXPENSE) {
            String monthYear = expense.getExpenseDate().format(MONTH_FORMATTER);
            String key = redisKey(userId, monthYear, expense.getCategory());
            redisTemplate.opsForValue().increment(key, -expense.getAmount().doubleValue());
            log.debug("Redis DECR key={} by {}", key, expense.getAmount());
        }

        expenseRepository.delete(expense);
    }

    // ─── Monthly Summary ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public MonthlyBreakdownResponse getMonthlySummary(Long userId, String monthYear) {
        if (monthYear == null || monthYear.isBlank()) {
            monthYear = LocalDate.now().format(MONTH_FORMATTER);
        }
        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        BigDecimal totalIncome = expenseRepository.sumTotalIncomeByUserAndDateRange(userId, from, to);
        BigDecimal totalExpense = expenseRepository.sumTotalExpenseByUserAndDateRange(userId, from, to);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        List<Object[]> rawBreakdown = expenseRepository.findCategoryBreakdownByUserAndDateRange(userId, from, to);
        List<MonthlyBreakdownResponse.CategoryBreakdown> breakdown = rawBreakdown.stream()
                .map(row -> {
                    Category cat = (Category) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    double percentage = totalExpense.compareTo(BigDecimal.ZERO) == 0
                            ? 0.0
                            : amount.divide(totalExpense, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(1, RoundingMode.HALF_UP)
                                    .doubleValue();
                    return MonthlyBreakdownResponse.CategoryBreakdown.builder()
                            .category(cat.name())
                            .amount(amount)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return MonthlyBreakdownResponse.builder()
                .monthYear(monthYear)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .categoryBreakdown(breakdown)
                .build();
    }

    // ─── Admin ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesForUser(Long userId) {
        return expenseRepository.findByUserIdOrderByExpenseDateDescCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getPlatformStats() {
        java.math.BigDecimal totalSpend = expenseRepository.sumAllExpenses();
        Long distinctUsers = expenseRepository.countDistinctUsers();
        java.math.BigDecimal avgPerUser = (distinctUsers != null && distinctUsers > 0)
                ? totalSpend.divide(java.math.BigDecimal.valueOf(distinctUsers), 2, RoundingMode.HALF_UP)
                : java.math.BigDecimal.ZERO;

        List<Object[]> topCatsRaw = expenseRepository.findTopCategories();
        List<java.util.Map<String, Object>> topCategories = topCatsRaw.stream()
                .limit(5)
                .map(row -> java.util.Map.<String, Object>of(
                        "category", ((Category) row[0]).name(),
                        "totalSpend", row[1]
                ))
                .collect(Collectors.toList());

        return java.util.Map.of(
                "totalPlatformSpend", totalSpend,
                "distinctUsers", distinctUsers,
                "avgSpendPerUser", avgPerUser,
                "topCategories", topCategories
        );
    }

    @Transactional
    public void adminDeleteExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));

        // Adjust Redis cache
        if (expense.getType() == TransactionType.EXPENSE) {
            String monthYear = expense.getExpenseDate().format(MONTH_FORMATTER);
            String key = redisKey(expense.getUserId(), monthYear, expense.getCategory());
            redisTemplate.opsForValue().increment(key, -expense.getAmount().doubleValue());
        }
        expenseRepository.delete(expense);
    }

    // ─── Private Helpers ──────────────────────────────────────────

    private void adjustRedisOnUpdate(Long userId, Expense old, ExpenseRequest updated) {
        // Decrement old amount if old was EXPENSE
        if (old.getType() == TransactionType.EXPENSE) {
            String monthYear = old.getExpenseDate().format(MONTH_FORMATTER);
            String key = redisKey(userId, monthYear, old.getCategory());
            redisTemplate.opsForValue().increment(key, -old.getAmount().doubleValue());
        }
        // Increment new amount if new is EXPENSE
        if (updated.getType() == TransactionType.EXPENSE) {
            String monthYear = updated.getExpenseDate().format(MONTH_FORMATTER);
            String key = redisKey(userId, monthYear, updated.getCategory());
            redisTemplate.opsForValue().increment(key, updated.getAmount().doubleValue());
        }
    }

    private LocalDate[] resolveDateRange(LocalDate from, LocalDate to, String view) {
        if (view != null) {
            LocalDate today = LocalDate.now();
            return switch (view) {
                case "today" -> new LocalDate[]{today, today};
                case "week" -> new LocalDate[]{today.minusDays(6), today};
                case "month" -> {
                    LocalDate start = today.withDayOfMonth(1);
                    yield new LocalDate[]{start, today};
                }
                default -> new LocalDate[]{from, to};
            };
        }
        return new LocalDate[]{from, to};
    }

    public ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .userId(expense.getUserId())
                .type(expense.getType())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .paymentMethod(expense.getPaymentMethod())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
