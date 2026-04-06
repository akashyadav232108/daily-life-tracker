package com.tracker.expense.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import com.tracker.expense.model.dto.response.CsvImportResponse;
import com.tracker.expense.model.dto.response.ExpenseResponse;
import com.tracker.expense.model.entity.Expense;
import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.PaymentMethod;
import com.tracker.expense.model.enums.TransactionType;
import com.tracker.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Parses a generic CSV file of expenses/income and bulk-imports them.
 *
 * <h3>Expected CSV format (header row required):</h3>
 * <pre>
 * date,type,amount,description,category,payment_method
 * 2026-04-01,EXPENSE,1500.00,Swiggy order,FOOD,UPI
 * 2026-04-02,INCOME,50000.00,Monthly salary,SALARY,BANK_TRANSFER
 * </pre>
 *
 * <ul>
 *   <li><b>date</b>        — {@code YYYY-MM-DD} (required)</li>
 *   <li><b>type</b>        — {@code INCOME} or {@code EXPENSE} (required)</li>
 *   <li><b>amount</b>      — positive number (required)</li>
 *   <li><b>description</b> — free text (optional)</li>
 *   <li><b>category</b>    — one of the {@link Category} enum values (optional — auto-detected from description)</li>
 *   <li><b>payment_method</b> — one of {@link PaymentMethod} values (optional, defaults to {@code OTHER})</li>
 * </ul>
 *
 * <h3>Auto-categorization</h3>
 * If {@code category} is blank or invalid, the service attempts to infer it from keywords
 * in the {@code description} field. Falls back to {@code OTHER} if nothing matches.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CsvImportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ExpenseRepository expenseRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final BudgetService budgetService;
    private final ExpenseService expenseService;   // reuse toResponse()

    // ─── Auto-categorization keyword map ─────────────────────────

    /**
     * Lower-case keyword fragments → Category.
     * Checked in declaration order; first match wins.
     */
    private static final LinkedHashMap<String, Category> KEYWORD_MAP = new LinkedHashMap<>();

    static {
        // FOOD
        KEYWORD_MAP.put("swiggy",       Category.FOOD);
        KEYWORD_MAP.put("zomato",       Category.FOOD);
        KEYWORD_MAP.put("restaurant",   Category.FOOD);
        KEYWORD_MAP.put("grocery",      Category.FOOD);
        KEYWORD_MAP.put("groceries",    Category.FOOD);
        KEYWORD_MAP.put("bigbazaar",    Category.FOOD);
        KEYWORD_MAP.put("dmart",        Category.FOOD);
        KEYWORD_MAP.put("cafe",         Category.FOOD);
        KEYWORD_MAP.put("canteen",      Category.FOOD);
        KEYWORD_MAP.put("lunch",        Category.FOOD);
        KEYWORD_MAP.put("dinner",       Category.FOOD);
        KEYWORD_MAP.put("breakfast",    Category.FOOD);
        KEYWORD_MAP.put("milk",         Category.FOOD);
        KEYWORD_MAP.put("dominos",      Category.FOOD);
        KEYWORD_MAP.put("pizza",        Category.FOOD);
        KEYWORD_MAP.put("mcdonald",     Category.FOOD);
        KEYWORD_MAP.put("kfc",          Category.FOOD);

        // TRANSPORT
        KEYWORD_MAP.put("uber",         Category.TRANSPORT);
        KEYWORD_MAP.put("ola",          Category.TRANSPORT);
        KEYWORD_MAP.put("rapido",       Category.TRANSPORT);
        KEYWORD_MAP.put("metro",        Category.TRANSPORT);
        KEYWORD_MAP.put("bus",          Category.TRANSPORT);
        KEYWORD_MAP.put("train",        Category.TRANSPORT);
        KEYWORD_MAP.put("auto",         Category.TRANSPORT);
        KEYWORD_MAP.put("petrol",       Category.TRANSPORT);
        KEYWORD_MAP.put("diesel",       Category.TRANSPORT);
        KEYWORD_MAP.put("fuel",         Category.TRANSPORT);
        KEYWORD_MAP.put("toll",         Category.TRANSPORT);
        KEYWORD_MAP.put("parking",      Category.TRANSPORT);
        KEYWORD_MAP.put("cab",          Category.TRANSPORT);
        KEYWORD_MAP.put("flight",       Category.TRANSPORT);
        KEYWORD_MAP.put("airline",      Category.TRANSPORT);
        KEYWORD_MAP.put("indigo",       Category.TRANSPORT);
        KEYWORD_MAP.put("irctc",        Category.TRANSPORT);

        // RENT
        KEYWORD_MAP.put("rent",         Category.RENT);
        KEYWORD_MAP.put("landlord",     Category.RENT);
        KEYWORD_MAP.put("housing",      Category.RENT);
        KEYWORD_MAP.put("maintenance",  Category.RENT);

        // UTILITIES
        KEYWORD_MAP.put("electricity",  Category.UTILITIES);
        KEYWORD_MAP.put("water bill",   Category.UTILITIES);
        KEYWORD_MAP.put("gas bill",     Category.UTILITIES);
        KEYWORD_MAP.put("internet",     Category.UTILITIES);
        KEYWORD_MAP.put("wifi",         Category.UTILITIES);
        KEYWORD_MAP.put("broadband",    Category.UTILITIES);
        KEYWORD_MAP.put("recharge",     Category.UTILITIES);
        KEYWORD_MAP.put("mobile bill",  Category.UTILITIES);

        // ENTERTAINMENT
        KEYWORD_MAP.put("netflix",      Category.ENTERTAINMENT);
        KEYWORD_MAP.put("hotstar",      Category.ENTERTAINMENT);
        KEYWORD_MAP.put("prime video",  Category.ENTERTAINMENT);
        KEYWORD_MAP.put("spotify",      Category.ENTERTAINMENT);
        KEYWORD_MAP.put("movie",        Category.ENTERTAINMENT);
        KEYWORD_MAP.put("cinema",       Category.ENTERTAINMENT);
        KEYWORD_MAP.put("pvr",          Category.ENTERTAINMENT);
        KEYWORD_MAP.put("inox",         Category.ENTERTAINMENT);
        KEYWORD_MAP.put("game",         Category.ENTERTAINMENT);
        KEYWORD_MAP.put("youtube",      Category.ENTERTAINMENT);

        // HEALTH
        KEYWORD_MAP.put("pharmacy",     Category.HEALTH);
        KEYWORD_MAP.put("hospital",     Category.HEALTH);
        KEYWORD_MAP.put("doctor",       Category.HEALTH);
        KEYWORD_MAP.put("clinic",       Category.HEALTH);
        KEYWORD_MAP.put("medicine",     Category.HEALTH);
        KEYWORD_MAP.put("medical",      Category.HEALTH);
        KEYWORD_MAP.put("gym",          Category.HEALTH);
        KEYWORD_MAP.put("fitness",      Category.HEALTH);
        KEYWORD_MAP.put("health",       Category.HEALTH);
        KEYWORD_MAP.put("lab test",     Category.HEALTH);
        KEYWORD_MAP.put("apollo",       Category.HEALTH);
        KEYWORD_MAP.put("1mg",          Category.HEALTH);
        KEYWORD_MAP.put("netmeds",      Category.HEALTH);

        // SHOPPING
        KEYWORD_MAP.put("amazon",       Category.SHOPPING);
        KEYWORD_MAP.put("flipkart",     Category.SHOPPING);
        KEYWORD_MAP.put("myntra",       Category.SHOPPING);
        KEYWORD_MAP.put("meesho",       Category.SHOPPING);
        KEYWORD_MAP.put("nykaa",        Category.SHOPPING);
        KEYWORD_MAP.put("ajio",         Category.SHOPPING);
        KEYWORD_MAP.put("shopify",      Category.SHOPPING);
        KEYWORD_MAP.put("mall",         Category.SHOPPING);
        KEYWORD_MAP.put("clothes",      Category.SHOPPING);
        KEYWORD_MAP.put("shirt",        Category.SHOPPING);
        KEYWORD_MAP.put("shoes",        Category.SHOPPING);

        // EDUCATION
        KEYWORD_MAP.put("course",       Category.EDUCATION);
        KEYWORD_MAP.put("udemy",        Category.EDUCATION);
        KEYWORD_MAP.put("coursera",     Category.EDUCATION);
        KEYWORD_MAP.put("college",      Category.EDUCATION);
        KEYWORD_MAP.put("school",       Category.EDUCATION);
        KEYWORD_MAP.put("tuition",      Category.EDUCATION);
        KEYWORD_MAP.put("books",        Category.EDUCATION);
        KEYWORD_MAP.put("fees",         Category.EDUCATION);

        // SALARY (usually INCOME)
        KEYWORD_MAP.put("salary",       Category.SALARY);
        KEYWORD_MAP.put("payroll",      Category.SALARY);
        KEYWORD_MAP.put("stipend",      Category.SALARY);
        KEYWORD_MAP.put("wages",        Category.SALARY);

        // INVESTMENT
        KEYWORD_MAP.put("sip",          Category.INVESTMENT);
        KEYWORD_MAP.put("mutual fund",  Category.INVESTMENT);
        KEYWORD_MAP.put("stocks",       Category.INVESTMENT);
        KEYWORD_MAP.put("zerodha",      Category.INVESTMENT);
        KEYWORD_MAP.put("groww",        Category.INVESTMENT);
        KEYWORD_MAP.put("insurance",    Category.INVESTMENT);
    }

    // ─── Public Import Method ──────────────────────────────────────

    @Transactional
    public CsvImportResponse importCsv(Long userId, String userEmail, MultipartFile file) throws IOException {
        List<String[]> rows = parseCsv(file);

        if (rows.isEmpty()) {
            return CsvImportResponse.builder()
                    .totalRows(0).imported(0).skipped(0)
                    .errors(List.of())
                    .expenses(List.of())
                    .build();
        }

        // Validate header
        String[] header = rows.get(0);
        Map<String, Integer> colIndex = buildColumnIndex(header);

        List<CsvImportResponse.RowError> errors = new ArrayList<>();
        List<ExpenseResponse> imported = new ArrayList<>();
        int dataRowCount = rows.size() - 1; // excluding header

        for (int i = 1; i < rows.size(); i++) {
            int rowNum = i + 1; // 1-based for user display
            String[] row = rows.get(i);

            try {
                Expense expense = parseRow(row, colIndex, userId, rowNum);
                expense = expenseRepository.save(expense);

                // Update Redis for EXPENSE type
                if (expense.getType() == TransactionType.EXPENSE) {
                    String monthYear = expense.getExpenseDate().format(MONTH_FORMATTER);
                    String key = "expense:monthly:" + userId + ":" + monthYear + ":" + expense.getCategory().name();
                    Double newTotal = redisTemplate.opsForValue()
                            .increment(key, expense.getAmount().doubleValue());
                    if (newTotal != null && newTotal.equals(expense.getAmount().doubleValue())) {
                        redisTemplate.expire(key, Duration.ofDays(60));
                    }
                    // Budget check
                    if (newTotal != null) {
                        budgetService.checkAndPublishBudgetAlert(
                                userId, userEmail, expense.getCategory(), monthYear,
                                BigDecimal.valueOf(newTotal), expense.getId());
                    }
                }

                imported.add(expenseService.toResponse(expense));
                log.debug("CSV import row={} → saved expenseId={}", rowNum, expense.getId());

            } catch (IllegalArgumentException e) {
                log.warn("CSV import row={} skipped: {}", rowNum, e.getMessage());
                errors.add(CsvImportResponse.RowError.builder()
                        .row(rowNum)
                        .reason(e.getMessage())
                        .build());
            }
        }

        return CsvImportResponse.builder()
                .totalRows(dataRowCount)
                .imported(imported.size())
                .skipped(errors.size())
                .errors(errors)
                .expenses(imported)
                .build();
    }

    // ─── CSV Parsing ──────────────────────────────────────────────

    private List<String[]> parseCsv(MultipartFile file) throws IOException {
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.readAll();
        } catch (CsvException e) {
            throw new IOException("Failed to parse CSV: " + e.getMessage(), e);
        }
    }

    private Map<String, Integer> buildColumnIndex(String[] header) {
        Map<String, Integer> index = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            index.put(header[i].trim().toLowerCase().replace(" ", "_"), i);
        }
        // Validate required columns
        for (String required : List.of("date", "type", "amount")) {
            if (!index.containsKey(required)) {
                throw new IllegalArgumentException(
                        "CSV header is missing required column: '" + required + "'. " +
                        "Expected: date,type,amount,description,category,payment_method");
            }
        }
        return index;
    }

    // ─── Row Parsing ──────────────────────────────────────────────

    private Expense parseRow(String[] row, Map<String, Integer> colIndex, Long userId, int rowNum) {
        // date
        LocalDate date = parseDate(get(row, colIndex, "date"), rowNum);

        // type
        TransactionType type = parseType(get(row, colIndex, "type"), rowNum);

        // amount
        BigDecimal amount = parseAmount(get(row, colIndex, "amount"), rowNum);

        // description (optional)
        String description = get(row, colIndex, "description");

        // category — try explicit value first, fall back to auto-detect
        String categoryRaw = get(row, colIndex, "category");
        Category category = parseCategory(categoryRaw, description);

        // payment_method (optional)
        String pmRaw = get(row, colIndex, "payment_method");
        PaymentMethod paymentMethod = parsePaymentMethod(pmRaw);

        return Expense.builder()
                .userId(userId)
                .type(type)
                .amount(amount)
                .category(category)
                .description(description.isBlank() ? null : description)
                .paymentMethod(paymentMethod)
                .expenseDate(date)
                .build();
    }

    // ─── Field Parsers ────────────────────────────────────────────

    private String get(String[] row, Map<String, Integer> colIndex, String col) {
        Integer idx = colIndex.get(col);
        if (idx == null || idx >= row.length) return "";
        return row[idx] == null ? "" : row[idx].trim();
    }

    private LocalDate parseDate(String raw, int row) {
        if (raw.isBlank()) throw new IllegalArgumentException("Row " + row + ": 'date' is required");
        try {
            return LocalDate.parse(raw, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Row " + row + ": invalid date '" + raw + "' — use YYYY-MM-DD");
        }
    }

    private TransactionType parseType(String raw, int row) {
        if (raw.isBlank()) throw new IllegalArgumentException("Row " + row + ": 'type' is required (INCOME or EXPENSE)");
        try {
            return TransactionType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Row " + row + ": invalid type '" + raw + "' — must be INCOME or EXPENSE");
        }
    }

    private BigDecimal parseAmount(String raw, int row) {
        if (raw.isBlank()) throw new IllegalArgumentException("Row " + row + ": 'amount' is required");
        try {
            BigDecimal val = new BigDecimal(raw.replace(",", ""));
            if (val.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Row " + row + ": 'amount' must be greater than 0");
            }
            return val;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Row " + row + ": invalid amount '" + raw + "' — must be a number");
        }
    }

    private Category parseCategory(String raw, String description) {
        // Try explicit value
        if (!raw.isBlank()) {
            try {
                return Category.valueOf(raw.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Fall through to auto-detect
            }
        }
        // Auto-detect from description
        return autoDetectCategory(description);
    }

    private Category autoDetectCategory(String description) {
        if (description == null || description.isBlank()) return Category.OTHER;
        String lower = description.toLowerCase();
        for (Map.Entry<String, Category> entry : KEYWORD_MAP.entrySet()) {
            if (lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return Category.OTHER;
    }

    private PaymentMethod parsePaymentMethod(String raw) {
        if (raw.isBlank()) return PaymentMethod.OTHER;
        try {
            return PaymentMethod.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethod.OTHER;
        }
    }
}
