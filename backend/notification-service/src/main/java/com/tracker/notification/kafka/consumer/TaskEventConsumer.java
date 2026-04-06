package com.tracker.notification.kafka.consumer;

import com.tracker.notification.model.dto.event.TaskEvent;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.model.enums.StreakType;
import com.tracker.notification.service.InsightsService;
import com.tracker.notification.service.NotificationService;
import com.tracker.notification.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes events from the `task-events` Kafka topic.
 *
 * Event types handled:
 *   TASK_CREATED   → update daily summary tasks_total
 *   TASK_COMPLETED → update daily summary tasks_completed + update TASK_COMPLETE streak
 *                    + create "Task Completed" in-app notification
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventConsumer {

    private final NotificationService notificationService;
    private final InsightsService     insightsService;
    private final StreakService        streakService;

    @KafkaListener(
            topics          = "${kafka.topic.task-events}",
            groupId         = "${spring.kafka.consumer.group-id}",
            containerFactory = "taskKafkaListenerContainerFactory"
    )
    public void consume(TaskEvent event) {
        if (event == null || event.getUserId() == null || event.getEventType() == null) {
            log.warn("Received invalid TaskEvent — skipping");
            return;
        }

        log.debug("TaskEvent received: type={} userId={} taskId={}",
                event.getEventType(), event.getUserId(), event.getTaskId());

        try {
            switch (event.getEventType()) {
                case "TASK_CREATED" -> handleTaskCreated(event);
                case "TASK_COMPLETED" -> handleTaskCompleted(event);
                default -> log.warn("Unknown TaskEvent type: {}", event.getEventType());
            }
        } catch (Exception ex) {
            // Log and swallow — Kafka consumer must not crash on a single bad event
            log.error("Error processing TaskEvent [type={} userId={}]: {}",
                    event.getEventType(), event.getUserId(), ex.getMessage(), ex);
        }
    }

    // ── Handlers ────────────────────────────────────────────────────

    private void handleTaskCreated(TaskEvent event) {
        insightsService.onTaskCreated(event.getUserId());
        log.debug("Daily summary tasks_total incremented for user {}", event.getUserId());
    }

    private void handleTaskCompleted(TaskEvent event) {
        Long userId = event.getUserId();

        // 1. Update daily summary
        insightsService.onTaskCompleted(userId);

        // 2. Update TASK_COMPLETE streak
        streakService.updateStreak(userId, StreakType.TASK_COMPLETE);

        // 3. Create in-app notification
        String taskTitle = event.getTaskTitle() != null ? event.getTaskTitle() : "a task";
        notificationService.createNotification(
                userId,
                "Task Completed ✅",
                "Great job! You completed '" + taskTitle + "'",
                NotificationType.TASK_REMINDER
        );

        log.info("TaskCompleted handled: userId={} taskId={}", userId, event.getTaskId());
    }
}
