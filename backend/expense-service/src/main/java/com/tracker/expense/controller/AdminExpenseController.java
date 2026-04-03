package com.tracker.expense.controller;

import com.tracker.expense.model.dto.response.ApiResponse;
import com.tracker.expense.model.dto.response.BudgetResponse;
import com.tracker.expense.model.dto.response.ExpenseResponse;
import com.tracker.expense.service.BudgetService;
import com.tracker.expense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin endpoints — ADMIN and SUPER_ADMIN only.
 * Base path: /api/expenses/admin
 *
 * SecurityConfig already restricts /api/expenses/admin/** to ADMIN/SUPER_ADMIN.
 * @PreAuthorize adds a second layer of protection per method.
 */
@RestController
@RequestMapping("/api/expenses/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminExpenseController {

    private final ExpenseService expenseService;
    private final BudgetService budgetService;

    /**
     * GET /api/expenses/admin/users/{userId}
     * View any user's expenses (read-only).
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getUserExpenses(
            @PathVariable Long userId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User expenses retrieved", expenses));
    }

    /**
     * GET /api/expenses/admin/users/{userId}/budgets
     * View any user's budgets (read-only).
     */
    @GetMapping("/users/{userId}/budgets")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getUserBudgets(
            @PathVariable Long userId) {
        List<BudgetResponse> budgets = budgetService.getBudgetsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User budgets retrieved", budgets));
    }

    /**
     * GET /api/expenses/admin/stats
     * Platform-wide expense statistics: total spend, avg per user, top categories.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        return ResponseEntity.ok(ApiResponse.success("Platform stats retrieved",
                expenseService.getPlatformStats()));
    }

    /**
     * DELETE /api/expenses/admin/{expenseId}
     * Delete any user's expense entry — SUPER_ADMIN only.
     */
    @DeleteMapping("/{expenseId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnyExpense(
            @PathVariable Long expenseId) {
        expenseService.adminDeleteExpense(expenseId);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}
