package com.tracker.notification.service;

import com.tracker.notification.model.dto.response.StreakResponse;
import com.tracker.notification.model.entity.Streak;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.model.enums.StreakType;
import com.tracker.notification.repository.StreakRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private static final String STREAK_KEY = "streak:";
    private static final long   STREAK_TTL_HOURS = 48;

    // Milestone thresholds that trigger a notification
    private static final int[] MILESTONES = {7, 14, 30};

    private final StreakRepository   streakRepository;
    private final NotificationService notificationService;
    private final RedisTemplate<String, String> redisTemplate;

    // ══════════════════════════════════════════════════════════
    //  CORE STREAK UPDATE — called by Kafka consumers
    // ══════════════════════════════════════════════════════════

    /**
     * Main entry point — update the streak for a given user and type.
     *
     * Algorithm (from notification-service.md):
     *  1. Get (or create) the streak record
     *  2. lastActiveDate == today      → already counted, do nothing
     *  3. lastActiveDate == yesterday  → continuing streak, increment
     *  4. lastActiveDate < yesterday   → streak broken, restart at 1
     *  5. longestCount = max(longestCount, currentCount)
     *  6. lastActiveDate = today
     *  7. Save + update Redis cache
     *  8. Check milestones → fire notification if hit
     */
    @Transactional
    public void updateStreak(Long userId, StreakType type) {
        LocalDate today     = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        Streak streak = streakRepository.findByUserIdAndStreakType(userId, type)
                .orElseGet(() -> Streak.builder()
                        .userId(userId)
                        .streakType(type)
                        .currentCount(0)
                        .longestCount(0)
                        .build());

        LocalDate lastActive = streak.getLastActiveDate();

        if (today.equals(lastActive)) {
            // Already counted today — idempotent
            log.debug("Streak already counted today for user {} type {}", userId, type);
            return;
        }

        int previousCount = streak.getCurrentCount();

        if (yesterday.equals(lastActive) || lastActive == null) {
            // Continuing streak (or very first entry)
            streak.setCurrentCount(previousCount + 1);
        } else {
            // Streak broken — restart
            log.info("Streak broken for user {} type {} (last active: {})", userId, type, lastActive);
            streak.setCurrentCount(1);
        }

        streak.setLongestCount(Math.max(streak.getLongestCount(), streak.getCurrentCount()));
        streak.setLastActiveDate(today);

        streakRepository.save(streak);

        // Update Redis cache
        String redisKey = STREAK_KEY + userId + ":" + type.name();
        redisTemplate.opsForValue().set(redisKey, String.valueOf(streak.getCurrentCount()),
                STREAK_TTL_HOURS, TimeUnit.HOURS);

        log.debug("Streak updated: user={} type={} currentCount={}", userId, type, streak.getCurrentCount());

        // Check milestone and fire notification if hit
        checkAndFireMilestoneNotification(userId, type, streak.getCurrentCount());
    }

    // ══════════════════════════════════════════════════════════
    //  USER API
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/insights/streaks — all 3 streak records for a user.
     */
    public List<StreakResponse> getStreaksForUser(Long userId) {
        return streakRepository.findByUserId(userId)
                .stream()
                .map(StreakResponse::fromEntity)
                .toList();
    }

    /**
     * Get current streak count for a given type — from Redis (fallback to DB).
     */
    public int getCurrentStreak(Long userId, StreakType type) {
        String key    = STREAK_KEY + userId + ":" + type.name();
        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return Integer.parseInt(cached);
        }
        return streakRepository.findByUserIdAndStreakType(userId, type)
                .map(Streak::getCurrentCount)
                .orElse(0);
    }

    // ══════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════

    private void checkAndFireMilestoneNotification(Long userId, StreakType type, int currentCount) {
        for (int milestone : MILESTONES) {
            if (currentCount == milestone) {
                String label = getMilestoneLabel(milestone);
                String typeLabel = getTypeLabel(type);
                NotificationType notifType = getNotificationType(type);

                String title   = label + " " + typeLabel + " streak!";
                String message = "Amazing! You've kept your " + typeLabel.toLowerCase()
                        + " streak going for " + milestone + " days. Keep it up! 💪";

                notificationService.createNotification(userId, title, message, notifType);
                log.info("Milestone notification fired: user={} type={} milestone={}", userId, type, milestone);
                break;
            }
        }
    }

    private String getMilestoneLabel(int milestone) {
        return switch (milestone) {
            case 7  -> "🔥 1 week";
            case 14 -> "🔥🔥 2 week";
            case 30 -> "🏆 1 month";
            default -> milestone + " day";
        };
    }

    private String getTypeLabel(StreakType type) {
        return switch (type) {
            case HEALTH_LOG    -> "Health Log";
            case TASK_COMPLETE -> "Task Complete";
            case EXERCISE      -> "Exercise";
        };
    }

    private NotificationType getNotificationType(StreakType type) {
        return switch (type) {
            case HEALTH_LOG    -> NotificationType.HEALTH_STREAK;
            case TASK_COMPLETE -> NotificationType.TASK_REMINDER;
            case EXERCISE      -> NotificationType.EXERCISE_STREAK;
        };
    }

    /**
     * Get all streak entities for a user — used by schedulers and insights service.
     */
    public List<Streak> getStreakEntitiesForUser(Long userId) {
        return streakRepository.findByUserId(userId);
    }

    /**
     * Check if today is a rest day for the EXERCISE streak.
     * Currently returns false (no rest-day logic without plan data).
     * Extend this once health-service exposes a rest-day API.
     */
    public boolean isTodayRestDay(Long userId) {
        // TODO: Call health-service API to check if today is a rest day
        //       in the user's active exercise plan.
        //       Until then, we never skip — exercise streak breaks on missed days.
        return false;
    }
}
