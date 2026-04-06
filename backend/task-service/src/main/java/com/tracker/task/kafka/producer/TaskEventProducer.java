package com.tracker.task.kafka.producer;

import com.tracker.task.kafka.event.TaskEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

/**
 * Publishes task lifecycle events to the Kafka {@code task-events} topic.
 * Consumed by notification-service to update daily summaries and streaks.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventProducer {

    private static final String TOPIC = "task-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTaskCreated(Long userId, Long taskId, String taskTitle) {
        TaskEvent event = TaskEvent.builder()
                .userId(userId)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .eventType("TASK_CREATED")
                .timestamp(OffsetDateTime.now())
                .build();
        send(event);
    }

    public void publishTaskCompleted(Long userId, Long taskId, String taskTitle) {
        TaskEvent event = TaskEvent.builder()
                .userId(userId)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .eventType("TASK_COMPLETED")
                .timestamp(OffsetDateTime.now())
                .build();
        send(event);
    }

    private void send(TaskEvent event) {
        kafkaTemplate.send(TOPIC, String.valueOf(event.getUserId()), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish TaskEvent [type={}, userId={}, taskId={}]: {}",
                                event.getEventType(), event.getUserId(), event.getTaskId(), ex.getMessage());
                    } else {
                        log.debug("TaskEvent published [type={}, userId={}, taskId={}, offset={}]",
                                event.getEventType(), event.getUserId(), event.getTaskId(),
                                result.getRecordMetadata().offset());
                    }
                });
    }
}
