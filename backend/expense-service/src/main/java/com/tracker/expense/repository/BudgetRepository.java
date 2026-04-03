package com.tracker.expense.repository;

import com.tracker.expense.model.entity.Budget;
import com.tracker.expense.model.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Get all budgets for a user in a given month (e.g. "2026-04").
     */
    List<Budget> findByUserIdAndMonthYear(Long userId, String monthYear);

    /**
     * Find a specific budget by user, category, and month.
     * Used to check if a budget is already set before creating a new one.
     */
    Optional<Budget> findByUserIdAndCategoryAndMonthYear(Long userId, Category category, String monthYear);

    /**
     * Get all budgets for a specific user (admin view).
     */
    List<Budget> findByUserId(Long userId);
}
