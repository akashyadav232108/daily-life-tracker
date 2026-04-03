package com.tracker.expense.controller;

import com.tracker.expense.model.dto.request.ExpenseRequest;
import com.tracker.expense.model.dto.response.ApiResponse;
import com.tracker.expense.model.dto.response.ExpenseResponse;
import com.tracker.expense.model.dto.response.MonthlyBreakdownResponse;
import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.TransactionType;
import com.tracker.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Expense endpoints — any authenticated user (own data only).
 * Base path: /api/expenses
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * POST /api/expenses
     * Add a new expense or income entry.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            @Valid @RequestBody ExpenseRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        ExpenseResponse response = expenseService.addExpense(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense added successfully", response));
    }

    /**
     * GET /api/expenses
     * List own entries with optional filters: from, to, type, category, view.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) String view,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<ExpenseResponse> expenses = expenseService.getExpenses(userId, from, to, type, category, view);
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    /**
     * GET /api/expenses/{id}
     * Get a single entry by ID (own data only).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        ExpenseResponse response = expenseService.getExpenseById(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", response));
    }

    /**
     * PUT /api/expenses/{id}
     * Update an existing entry (own data only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        ExpenseResponse response = expenseService.updateExpense(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", response));
    }

    /**
     * DELETE /api/expenses/{id}
     * Delete an entry (own data only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        expenseService.deleteExpense(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }

    /**
     * GET /api/expenses/summary/monthly
     * Monthly income/expense breakdown by category.
     * Optional query param: monthYear (YYYY-MM, defaults to current month)
     */
    @GetMapping("/summary/monthly")
    public ResponseEntity<ApiResponse<MonthlyBreakdownResponse>> getMonthlySummary(
            @RequestParam(required = false) String monthYear,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        MonthlyBreakdownResponse response = expenseService.getMonthlySummary(userId, monthYear);
        return ResponseEntity.ok(ApiResponse.success("Monthly summary retrieved", response));
    }
}
