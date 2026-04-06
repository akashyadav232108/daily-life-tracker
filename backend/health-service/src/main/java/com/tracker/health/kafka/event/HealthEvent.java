package com.tracker.health.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Kafka event published to the {@code health-events} topic.
 *
 * <p>eventType values:
 * <ul>
 *   <li>{@code HEALTH_LOGGED}   — a daily health log was created/updated</li>
 *   <li>{@code EXERCISE_LOGGED} — an exercise session was logged</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthEvent {

    private Long userId;

    /** HEALTH_LOGGED | EXERCISE_LOGGED */
    private String eventType;

    /** Date of the log (may differ from today for back-fills) */
    private LocalDate logDate;

    /** Populated for HEALTH_LOGGED — e.g. "GOOD", "FAIR", "POOR" */
    private String mood;

    /** Populated for EXERCISE_LOGGED — e.g. "CHEST", "BACK", "LEGS" */
    private String muscleGroup;

    /** Exercise name — populated for EXERCISE_LOGGED */
    private String exerciseName;

    private OffsetDateTime timestamp;
}
