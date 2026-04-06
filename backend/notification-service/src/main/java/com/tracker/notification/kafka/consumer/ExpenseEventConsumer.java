package com.tracker.notification.kafka.consumer;

import com.tracker.notification.model.dto.event.ExpenseEvent;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.service.EmailService;
import com.tracker.notification.service.InsightsService;
import com.tracker.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Consumes events from the `expense-events` Kafka topic.
 *
 * Event types handled:
 *   EXPENSE_ADDED   → add amount to daily summary total_spent
 *                     → create in-app notification if amount is large (≥ 500)
 *
 *   BUDGET_EXCEEDED → create BUDGET_ALERT in-app notification
 *                     → send budget alert email (if userEmail is present in event)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventConsumer {

    /** Threshold above which a single expense triggers a "large expense" in-app notification */
    private static final BigDecimal LARGE_EXPENSE_THRESHOLD = new BigDecimal("500");

    private final NotificationService notificationService;
    private final InsightsService     insightsService;
    private final EmailService        emailService;

    @KafkaListener(
            topics           = "${kafka.topic.expense-events}",
            groupId          = "${spring.kafka.consumer.group-id}",
            containerFactory = "expenseKafkaListenerContainerFactory"
    )
    public void consume(ExpenseEvent event) {
        if (event == null || event.getUserId() == null || event.getEventType() == null) {
            log.warn("Received invalid ExpenseEvent — skipping");
            return;
        }

        log.debug("ExpenseEvent received: type={} userId={}", event.getEventType(), event.getUserId());

        try {
            switch (event.getEventType()) {
                case "EXPENSE_ADDED"   -> handleExpenseAdded(event);
                case "BUDGET_EXCEEDED" -> handleBudgetExceeded(event);
                default -> log.warn("Unknown ExpenseEvent type: {}", event.getEventType());
            }
        } catch (Exception ex) {
            log.error("Error processing ExpenseEvent [type={} userId={}]: {}",
                    event.getEventType(), event.getUserId(), ex.getMessage(), ex);
        }
    }

    // ── Handlers ────────────────────────────────────────────────────

    private void handleExpenseAdded(ExpenseEvent event) {
        Long userId = event.getUserId();
        BigDecimal amount = event.getAmount();

        // 1. Update daily summary total_spent
        insightsService.onExpenseAdded(userId, amount);

        // 2. Create in-app notification only if it's a large single expense
        if (amount != null && amount.compareTo(LARGE_EXPENSE_THRESHOLD) >= 0) {
            String category = event.getCategory() != null ? event.getCategory() : "General";
            notificationService.createNotification(
                    userId,
                    "Large Expense Recorded 💸",
                    "You just recorded a ₹" + amount.toPlainString()
                            + " expense in " + category + ". Keep an eye on your budget!",
                    NotificationType.BUDGET_ALERT
            );
        }

        log.debug("ExpenseAdded handled: userId={} amount={}", userId, amount);
    }

    private void handleBudgetExceeded(ExpenseEvent event) {
        Long userId = event.getUserId();
        String category = event.getCategory() != null ? event.getCategory() : "General";
        double percentUsed = event.getPercentUsed() != null ? event.getPercentUsed() : 0.0;

        // 1. Create in-app BUDGET_ALERT notification
        String emoji   = percentUsed >= 100 ? "🚨" : "⚠️";
        String title   = "Budget Alert " + emoji;
        String message = "You've spent " + String.format("%.0f", percentUsed) + "% of your "
                + category + " budget this month.";

        if (percentUsed >= 100) {
            message += " Your " + category + " budget has been exceeded!";
        }

        notificationService.createNotification(userId, title, message, NotificationType.BUDGET_ALERT);

        // 2. Send email alert (async — won't block this thread)
        emailService.sendBudgetAlert(event.getUserEmail(), category, percentUsed);

        log.info("BudgetExceeded handled: userId={} category={} percent={}%", userId, category, percentUsed);
    }
}
