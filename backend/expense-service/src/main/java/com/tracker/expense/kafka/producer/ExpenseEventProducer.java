package com.tracker.expense.kafka.producer;

import com.tracker.expense.model.enums.Category;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.expense-events}")
    private String expenseEventsTopic;

    // ─── Event POJOs ─────────────────────────────────────────────

    @Data
    @Builder
    public static class ExpenseAddedEvent {
        private Long userId;
        private Long expenseId;
        private BigDecimal amount;
        private String category;
        private String eventType;
        private OffsetDateTime timestamp;
    }

    @Data
    @Builder
    public static class BudgetExceededEvent {
        private Long userId;
        private String category;
        private BigDecimal monthlyLimit;
        private BigDecimal currentSpent;
        private Double percentUsed;
        private String eventType;
        private OffsetDateTime timestamp;
    }

    // ─── Publish Methods ─────────────────────────────────────────

    /**
     * Publishes an EXPENSE_ADDED event to Kafka after a new transaction is saved.
     */
    public void publishExpenseAdded(Long userId, Long expenseId, BigDecimal amount, Category category) {
        ExpenseAddedEvent event = ExpenseAddedEvent.builder()
                .userId(userId)
                .expenseId(expenseId)
                .amount(amount)
                .category(category.name())
                .eventType("EXPENSE_ADDED")
                .timestamp(OffsetDateTime.now())
                .build();

        kafkaTemplate.send(expenseEventsTopic, String.valueOf(userId), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish EXPENSE_ADDED event for expenseId={}: {}",
                                expenseId, ex.getMessage());
                    } else {
                        log.debug("Published EXPENSE_ADDED event: expenseId={}, userId={}", expenseId, userId);
                    }
                });
    }

    /**
     * Publishes a BUDGET_EXCEEDED event when spending crosses 80% or 100% of the monthly limit.
     */
    public void publishBudgetExceeded(Long userId, Category category,
                                       BigDecimal monthlyLimit, BigDecimal currentSpent,
                                       double percentUsed) {
        BudgetExceededEvent event = BudgetExceededEvent.builder()
                .userId(userId)
                .category(category.name())
                .monthlyLimit(monthlyLimit)
                .currentSpent(currentSpent)
                .percentUsed(percentUsed)
                .eventType("BUDGET_EXCEEDED")
                .timestamp(OffsetDateTime.now())
                .build();

        kafkaTemplate.send(expenseEventsTopic, String.valueOf(userId), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish BUDGET_EXCEEDED event for userId={}, category={}: {}",
                                userId, category, ex.getMessage());
                    } else {
                        log.debug("Published BUDGET_EXCEEDED event: userId={}, category={}, percent={}%",
                                userId, category, percentUsed);
                    }
                });
    }
}
