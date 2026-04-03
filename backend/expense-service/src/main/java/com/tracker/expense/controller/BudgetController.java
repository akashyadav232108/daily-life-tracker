package com.tracker.expense.controller;

import com.tracker.expense.model.dto.request.BudgetRequest;
import com.tracker.expense.model.dto.response.ApiResponse;
import com.tracker.expense.model.dto.response.BudgetResponse;
import com.tracker.expense.model.dto.response.BudgetStatusResponse;
import com.tracker.expense.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Budget endpoints — any authenticated user (own budgets only).
 * Base path: /api/budgets
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * POST /api/budgets
     * Set a monthly budget for a category.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        BudgetResponse response = budgetService.createBudget(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", response));
    }

    /**
     * GET /api/budgets
     * Get own budgets for a given month (defaults to current month).
     * Optional query param: monthYear (YYYY-MM)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @RequestParam(required = false) String monthYear,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<BudgetResponse> budgets = budgetService.getBudgets(userId, monthYear);
        return ResponseEntity.ok(ApiResponse.success("Budgets retrieved successfully", budgets));
    }

    /**
     * GET /api/budgets/status
     * Get spend vs limit status for each budget in the current month.
     * Optional query param: monthYear (YYYY-MM)
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<BudgetStatusResponse>>> getBudgetStatus(
            @RequestParam(required = false) String monthYear,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<BudgetStatusResponse> status = budgetService.getBudgetStatus(userId, monthYear);
        return ResponseEntity.ok(ApiResponse.success("Budget status retrieved", status));
    }

    /**
     * PUT /api/budgets/{id}
     * Update the monthly limit for an existing budget (own only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        BudgetResponse response = budgetService.updateBudget(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", response));
    }

    /**
     * DELETE /api/budgets/{id}
     * Delete a budget (own only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        budgetService.deleteBudget(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully", null));
    }
}
