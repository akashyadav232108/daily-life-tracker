package com.tracker.notification.model.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Kafka event received from task-service on the `task-events` topic.
 *
 * eventType values:
 *   - TASK_CREATED   → update daily summary tasks_total
 *   - TASK_COMPLETED → update daily summary tasks_completed + streak
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEvent {

    private Long userId;
    private Long taskId;
    private String taskTitle;

    /** TASK_CREATED | TASK_COMPLETED */
    private String eventType;

    private OffsetDateTime timestamp;
}
