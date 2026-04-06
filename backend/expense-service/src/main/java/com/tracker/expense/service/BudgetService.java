package com.tracker.expense.service;

import com.tracker.expense.exception.BudgetNotFoundException;
import com.tracker.expense.kafka.producer.ExpenseEventProducer;
import com.tracker.expense.model.dto.request.BudgetRequest;
import com.tracker.expense.model.dto.response.BudgetResponse;
import com.tracker.expense.model.dto.response.BudgetStatusResponse;
import com.tracker.expense.model.entity.Budget;
import com.tracker.expense.model.enums.Category;
import com.tracker.expense.repository.BudgetRepository;
import com.tracker.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ExpenseEventProducer eventProducer;

    // ─── CRUD ─────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Category is required when creating a budget");
        }
        String monthYear = resolveMonthYear(request.getMonthYear());

        // Enforce unique constraint at service level for a clear error message
        if (budgetRepository.findByUserIdAndCategoryAndMonthYear(userId, request.getCategory(), monthYear).isPresent()) {
            throw new IllegalArgumentException(
                    "Budget already exists for category " + request.getCategory() + " in " + monthYear +
                    ". Use PUT to update it.");
        }

        Budget budget = Budget.builder()
                .userId(userId)
                .category(request.getCategory())
                .monthlyLimit(request.getMonthlyLimit())
                .monthYear(monthYear)
                .build();

        budget = budgetRepository.save(budget);
        return toResponse(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId, String monthYear) {
        String month = resolveMonthYear(monthYear);
        return budgetRepository.findByUserIdAndMonthYear(userId, month)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new BudgetNotFoundException(budgetId));

        if (!budget.getUserId().equals(userId)) {
            throw new BudgetNotFoundException(budgetId);
        }

        budget.setMonthlyLimit(request.getMonthlyLimit());
        if (request.getMonthYear() != null) {
            budget.setMonthYear(resolveMonthYear(request.getMonthYear()));
        }
        budget = budgetRepository.save(budget);
        return toResponse(budget);
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new BudgetNotFoundException(budgetId));

        if (!budget.getUserId().equals(userId)) {
            throw new BudgetNotFoundException(budgetId);
        }
        budgetRepository.delete(budget);
    }

    // ─── Budget Status ─────────────────────────────────────────────

    /**
     * Returns the spend vs limit status for all budgets the user has set for the current month.
     * Reads cached monthly totals from Redis; falls back to DB on cache miss.
     */
    @Transactional(readOnly = true)
    public List<BudgetStatusResponse> getBudgetStatus(Long userId, String monthYear) {
        String month = resolveMonthYear(monthYear);
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, month);

        return budgets.stream()
                .map(budget -> {
                    BigDecimal spent = getSpentAmount(userId, budget.getCategory(), month);
                    BigDecimal remaining = budget.getMonthlyLimit().subtract(spent);
                    double percentUsed = budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) == 0
                            ? 0.0
                            : spent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(1, RoundingMode.HALF_UP)
                                    .doubleValue();

                    return BudgetStatusResponse.builder()
                            .budgetId(budget.getId())
                            .category(budget.getCategory())
                            .monthlyLimit(budget.getMonthlyLimit())
                            .spent(spent)
                            .remaining(remaining.max(BigDecimal.ZERO))
                            .percentUsed(percentUsed)
                            .monthYear(month)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ─── Admin ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsForUser(Long userId) {
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Budget Alert Logic ─────────────────────────────────────────

    /**
     * Called after every EXPENSE is added.
     * Checks if 80% or 100% threshold is crossed and publishes Kafka event if so.
     */
    public void checkAndPublishBudgetAlert(Long userId, String userEmail, Category category,
                                            String monthYear, BigDecimal currentSpent,
                                            Long expenseId) {
        Optional<Budget> budgetOpt = budgetRepository
                .findByUserIdAndCategoryAndMonthYear(userId, category, monthYear);

        if (budgetOpt.isEmpty()) return; // No budget set — nothing to check

        Budget budget = budgetOpt.get();
        BigDecimal limit = budget.getMonthlyLimit();
        if (limit.compareTo(BigDecimal.ZERO) == 0) return;

        double percent = currentSpent
                .divide(limit, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();

        if (percent >= 100.0 || percent >= 80.0) {
            log.info("Budget alert: userId={} category={} spent={}% of limit={}",
                    userId, category, percent, limit);
            eventProducer.publishBudgetExceeded(userId, userEmail, category, limit, currentSpent, percent);
        }
    }

    // ─── Private Helpers ───────────────────────────────────────────

    /**
     * Gets the total spent for a user/category/month.
     * Reads from Redis cache; falls back to DB if cache miss.
     */
    private BigDecimal getSpentAmount(Long userId, Category category, String monthYear) {
        String key = "expense:monthly:" + userId + ":" + monthYear + ":" + category.name();
        String cached = redisTemplate.opsForValue().get(key);

        if (cached != null) {
            try {
                return new BigDecimal(cached);
            } catch (NumberFormatException e) {
                log.warn("Invalid Redis value for key={}: {}", key, cached);
            }
        }

        // Cache miss — query DB
        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        return expenseRepository.sumExpenseByUserAndCategoryAndDateRange(userId, category, from, to);
    }

    private String resolveMonthYear(String monthYear) {
        if (monthYear == null || monthYear.isBlank()) {
            return LocalDate.now().format(MONTH_FORMATTER);
        }
        return monthYear;
    }

    private BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUserId())
                .category(budget.getCategory())
                .monthlyLimit(budget.getMonthlyLimit())
                .monthYear(budget.getMonthYear())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
