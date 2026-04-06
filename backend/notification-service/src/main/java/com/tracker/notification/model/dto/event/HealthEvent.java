package com.tracker.notification.model.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Kafka event received from health-service on the `health-events` topic.
 *
 * eventType values:
 *   - HEALTH_LOGGED   → daily summary health_logged = true, update HEALTH_LOG streak
 *                       mood field will be populated
 *   - EXERCISE_LOGGED → daily summary exercise_logged = true, update EXERCISE streak
 *                       muscleGroup field will be populated
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthEvent {

    private Long userId;

    /** HEALTH_LOGGED | EXERCISE_LOGGED */
    private String eventType;

    /** The date of the log (may differ from today for backfill) */
    private LocalDate logDate;

    /** Populated for HEALTH_LOGGED events — e.g. "GOOD", "FAIR", "POOR" */
    private String mood;

    /** Populated for EXERCISE_LOGGED events — e.g. "CHEST", "BACK", "LEGS" */
    private String muscleGroup;

    /** Exercise name — populated for EXERCISE_LOGGED events */
    private String exerciseName;

    private OffsetDateTime timestamp;
}
