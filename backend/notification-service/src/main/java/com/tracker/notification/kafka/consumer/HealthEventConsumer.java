package com.tracker.notification.kafka.consumer;

import com.tracker.notification.model.dto.event.HealthEvent;
import com.tracker.notification.model.enums.StreakType;
import com.tracker.notification.service.InsightsService;
import com.tracker.notification.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes events from the `health-events` Kafka topic.
 *
 * Event types handled:
 *   HEALTH_LOGGED   → daily summary health_logged = true, store mood
 *                     → update HEALTH_LOG streak
 *                     → milestone notification if streak hits 7/14/30
 *
 *   EXERCISE_LOGGED → daily summary exercise_logged = true
 *                     → update EXERCISE streak (unless today is a rest day)
 *                     → milestone notification if streak hits 7/14/30
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HealthEventConsumer {

    private final InsightsService insightsService;
    private final StreakService   streakService;

    @KafkaListener(
            topics           = "${kafka.topic.health-events}",
            groupId          = "${spring.kafka.consumer.group-id}",
            containerFactory = "healthKafkaListenerContainerFactory"
    )
    public void consume(HealthEvent event) {
        if (event == null || event.getUserId() == null || event.getEventType() == null) {
            log.warn("Received invalid HealthEvent — skipping");
            return;
        }

        log.debug("HealthEvent received: type={} userId={}", event.getEventType(), event.getUserId());

        try {
            switch (event.getEventType()) {
                case "HEALTH_LOGGED"   -> handleHealthLogged(event);
                case "EXERCISE_LOGGED" -> handleExerciseLogged(event);
                default -> log.warn("Unknown HealthEvent type: {}", event.getEventType());
            }
        } catch (Exception ex) {
            log.error("Error processing HealthEvent [type={} userId={}]: {}",
                    event.getEventType(), event.getUserId(), ex.getMessage(), ex);
        }
    }

    // ── Handlers ────────────────────────────────────────────────────

    private void handleHealthLogged(HealthEvent event) {
        Long userId = event.getUserId();

        // 1. Update daily summary — health_logged = true, store mood
        insightsService.onHealthLogged(userId, event.getMood());

        // 2. Update HEALTH_LOG streak (streak service also fires milestone notifications)
        streakService.updateStreak(userId, StreakType.HEALTH_LOG);

        log.info("HealthLogged handled: userId={} mood={}", userId, event.getMood());
    }

    private void handleExerciseLogged(HealthEvent event) {
        Long userId = event.getUserId();

        // 1. Update daily summary — exercise_logged = true
        insightsService.onExerciseLogged(userId);

        // 2. Update EXERCISE streak — skip if today is a rest day
        if (!streakService.isTodayRestDay(userId)) {
            streakService.updateStreak(userId, StreakType.EXERCISE);
        } else {
            log.debug("Exercise streak not updated for user {} — today is a rest day", userId);
        }

        log.info("ExerciseLogged handled: userId={} muscleGroup={}", userId, event.getMuscleGroup());
    }
}
