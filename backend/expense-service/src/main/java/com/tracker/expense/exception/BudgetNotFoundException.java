package com.tracker.expense.exception;

public class BudgetNotFoundException extends RuntimeException {
    public BudgetNotFoundException(String message) {
        super(message);
    }

    public BudgetNotFoundException(Long id) {
        super("Budget not found with id: " + id);
    }
}
