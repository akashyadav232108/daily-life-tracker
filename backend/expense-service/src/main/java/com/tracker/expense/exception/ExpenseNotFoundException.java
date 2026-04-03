package com.tracker.expense.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException(String message) {
        super(message);
    }

    public ExpenseNotFoundException(Long id) {
        super("Expense not found with id: " + id);
    }
}
