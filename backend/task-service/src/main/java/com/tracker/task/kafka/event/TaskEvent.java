package com.tracker.task.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Kafka event published to the {@code task-events} topic.
 *
 * <p>eventType values:
 * <ul>
 *   <li>{@code TASK_CREATED}   — a new task was created</li>
 *   <li>{@code TASK_COMPLETED} — a task was marked as done</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEvent {

    private Long   userId;
    private Long   taskId;
    private String taskTitle;

    /** TASK_CREATED | TASK_COMPLETED */
    private String eventType;

    private OffsetDateTime timestamp;
}
