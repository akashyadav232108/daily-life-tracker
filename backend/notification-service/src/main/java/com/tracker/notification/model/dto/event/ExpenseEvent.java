package com.tracker.notification.model.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Kafka event received from expense-service on the `expense-events` topic.
 *
 * eventType values:
 *   - EXPENSE_ADDED    → update daily summary total_spent
 *                        fields: userId, expenseId, amount, category
 *   - BUDGET_EXCEEDED  → create BUDGET_ALERT notification + send email
 *                        fields: userId, category, monthlyLimit, currentSpent, percentUsed
 *
 * Both event types are deserialized into this single class.
 * Null-check fields based on eventType before using them.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseEvent {

    private Long userId;

    /** EXPENSE_ADDED | BUDGET_EXCEEDED */
    private String eventType;

    // ── EXPENSE_ADDED fields ────────────────────────────────────────
    private Long expenseId;
    private BigDecimal amount;

    // ── Shared field ────────────────────────────────────────────────
    /** Expense category — e.g. "FOOD", "TRANSPORT", "ENTERTAINMENT" */
    private String category;

    // ── BUDGET_EXCEEDED fields ──────────────────────────────────────
    private BigDecimal monthlyLimit;
    private BigDecimal currentSpent;
    private Double percentUsed;

    private OffsetDateTime timestamp;
}
