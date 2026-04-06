package com.tracker.health.kafka.producer;

import com.tracker.health.kafka.event.HealthEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Publishes health lifecycle events to the Kafka {@code health-events} topic.
 * Consumed by notification-service to update daily summaries and streaks.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HealthEventProducer {

    private static final String TOPIC = "health-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish a HEALTH_LOGGED event when a user saves their daily health log.
     *
     * @param userId  the user who logged data
     * @param logDate the date of the log
     * @param mood    the user's mood as a string (nullable)
     */
    public void publishHealthLogged(Long userId, LocalDate logDate, String mood) {
        HealthEvent event = HealthEvent.builder()
                .userId(userId)
                .eventType("HEALTH_LOGGED")
                .logDate(logDate)
                .mood(mood)
                .timestamp(OffsetDateTime.now())
                .build();
        send(event);
    }

    /**
     * Publish an EXERCISE_LOGGED event when a user logs an exercise session.
     *
     * @param userId       the user who logged data
     * @param logDate      the date of the exercise
     * @param exerciseName name of the exercise
     * @param muscleGroup  muscle group targeted (nullable)
     */
    public void publishExerciseLogged(Long userId, LocalDate logDate,
                                      String exerciseName, String muscleGroup) {
        HealthEvent event = HealthEvent.builder()
                .userId(userId)
                .eventType("EXERCISE_LOGGED")
                .logDate(logDate)
                .exerciseName(exerciseName)
                .muscleGroup(muscleGroup)
                .timestamp(OffsetDateTime.now())
                .build();
        send(event);
    }

    private void send(HealthEvent event) {
        kafkaTemplate.send(TOPIC, String.valueOf(event.getUserId()), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish HealthEvent [type={}, userId={}]: {}",
                                event.getEventType(), event.getUserId(), ex.getMessage());
                    } else {
                        log.debug("HealthEvent published [type={}, userId={}, offset={}]",
                                event.getEventType(), event.getUserId(),
                                result.getRecordMetadata().offset());
                    }
                });
    }
}
