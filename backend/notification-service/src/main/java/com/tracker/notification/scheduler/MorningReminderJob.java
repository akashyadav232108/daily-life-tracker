package com.tracker.notification.scheduler;

import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.repository.DailySummaryRepository;
import com.tracker.notification.service.NotificationService;
import com.tracker.notification.service.StreakService;
import com.tracker.notification.model.enums.StreakType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs every day at 8:00 AM.
 *
 * For every active user (anyone who has a daily summary record in the last 30 days):
 *  1. Creates a "Good morning" in-app notification with today's task/workout reminder.
 *  2. If the user has an active exercise streak, mentions their current streak count.
 *
 * Note: We don't call health-service directly to get today's workout plan because
 * this service is event-driven. The workout plan cache (workout:today:{userId}) is
 * populated when the health-service publishes EXERCISE_LOGGED events.
 * For now, we send a generic morning reminder and mention the exercise streak.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MorningReminderJob {

    private final NotificationService      notificationService;
    private final DailySummaryRepository   dailySummaryRepository;
    private final StreakService             streakService;

    /**
     * Cron: 0 0 8 * * *  — every day at 8:00 AM (server timezone = UTC)
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendMorningReminders() {
        log.info("MorningReminderJob started");
        LocalDate since = LocalDate.now().minusDays(30);

        // Get all users active in the last 30 days
        List<Long> userIds = dailySummaryRepository.findDistinctUserIdsSince(since);

        if (userIds.isEmpty()) {
            log.info("MorningReminderJob — no active users found, skipping");
            return;
        }

        int sent = 0;
        for (Long userId : userIds) {
            try {
                sendMorningReminderToUser(userId);
                sent++;
            } catch (Exception ex) {
                log.error("MorningReminderJob failed for userId={}: {}", userId, ex.getMessage());
            }
        }

        log.info("MorningReminderJob completed — sent {} reminders", sent);
    }

    private void sendMorningReminderToUser(Long userId) {
        int exerciseStreak = streakService.getCurrentStreak(userId, StreakType.EXERCISE);
        boolean isTodayRestDay = streakService.isTodayRestDay(userId);

        StringBuilder message = new StringBuilder();
        message.append("Good morning! 🌅 Start your day strong. ");
        message.append("Check your tasks, log your health, and track your expenses.");

        // Append exercise context
        if (isTodayRestDay) {
            message.append(" Today is a rest day — recover well! 💪");
        } else if (exerciseStreak > 0) {
            message.append(" Keep your ")
                    .append(exerciseStreak)
                    .append("-day exercise streak going! 🔥");
        } else {
            message.append(" Don't forget to log your workout today! 🏋️");
        }

        notificationService.createNotification(
                userId,
                "Good Morning! ☀️",
                message.toString(),
                NotificationType.EXERCISE_REMINDER
        );

        log.debug("Morning reminder sent to user {}", userId);
    }
}
