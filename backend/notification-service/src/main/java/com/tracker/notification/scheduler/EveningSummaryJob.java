package com.tracker.notification.scheduler;

import com.tracker.notification.model.entity.DailySummary;
import com.tracker.notification.model.entity.Streak;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.repository.DailySummaryRepository;
import com.tracker.notification.service.EmailService;
import com.tracker.notification.service.NotificationService;
import com.tracker.notification.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Runs every day at 9:00 PM.
 *
 * For every active user:
 *  1. Reads today's daily_summaries record (built from Kafka events throughout the day).
 *  2. Creates an in-app DAILY_SUMMARY notification with a formatted recap.
 *  3. Sends an HTML email with the full daily summary (async, fire-and-forget).
 *
 * Note: Email is only sent if the user's email is known. Since this service
 * does not store user emails, the email field on DailySummary would need to be
 * populated. For now, email sending is skipped with a logged warning.
 * A future enhancement is to expose a user-email lookup endpoint on auth-service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EveningSummaryJob {

    private final NotificationService    notificationService;
    private final DailySummaryRepository dailySummaryRepository;
    private final StreakService          streakService;
    private final EmailService           emailService;

    /**
     * Cron: 0 0 21 * * *  — every day at 9:00 PM (server timezone = UTC)
     */
    @Scheduled(cron = "0 0 21 * * *")
    public void sendEveningSummaries() {
        log.info("EveningSummaryJob started");
        LocalDate today = LocalDate.now();
        LocalDate since = today.minusDays(30);

        List<Long> userIds = dailySummaryRepository.findDistinctUserIdsSince(since);

        if (userIds.isEmpty()) {
            log.info("EveningSummaryJob — no active users found, skipping");
            return;
        }

        int sent = 0;
        for (Long userId : userIds) {
            try {
                sendEveningSummaryToUser(userId, today);
                sent++;
            } catch (Exception ex) {
                log.error("EveningSummaryJob failed for userId={}: {}", userId, ex.getMessage());
            }
        }

        log.info("EveningSummaryJob completed — sent {} summaries", sent);
    }

    private void sendEveningSummaryToUser(Long userId, LocalDate today) {
        // 1. Get today's daily summary (may not exist if user was inactive today)
        DailySummary summary = dailySummaryRepository
                .findByUserIdAndSummaryDate(userId, today)
                .orElse(null);

        // 2. Build in-app notification message
        String message = buildSummaryMessage(summary);

        notificationService.createNotification(
                userId,
                "📊 Your Daily Summary",
                message,
                NotificationType.DAILY_SUMMARY
        );

        // 3. Send email summary (async) — skipped if no summary data
        //    NOTE: userEmail is not stored in this service.
        //    To enable emails, auth-service needs to expose GET /api/users/{id}/email
        //    or the daily_summaries table needs a user_email column populated from events.
        if (summary != null) {
            List<Streak> streaks = streakService.getStreakEntitiesForUser(userId);
            // emailService.sendDailySummary(userEmail, summary, streaks);
            // Skipped until user email resolution is implemented
            log.debug("Evening summary email skipped for userId={} — email lookup not implemented", userId);
        }

        log.debug("Evening summary notification sent to user {}", userId);
    }

    private String buildSummaryMessage(DailySummary summary) {
        if (summary == null) {
            return "No activity recorded today. Tomorrow is a fresh start! 🌟";
        }

        int completed = summary.getTasksCompleted() != null ? summary.getTasksCompleted() : 0;
        int total     = summary.getTasksTotal()     != null ? summary.getTasksTotal()     : 0;
        boolean healthLogged   = Boolean.TRUE.equals(summary.getHealthLogged());
        boolean exerciseLogged = Boolean.TRUE.equals(summary.getExerciseLogged());
        BigDecimal spent       = summary.getTotalSpent() != null ? summary.getTotalSpent() : BigDecimal.ZERO;

        StringBuilder sb = new StringBuilder();

        // Tasks
        sb.append("✅ Tasks: ").append(completed).append("/").append(total).append(" completed. ");

        // Health
        sb.append(healthLogged ? "❤️ Health logged. " : "❤️ Health not logged today. ");

        // Exercise
        sb.append(exerciseLogged ? "🏋️ Exercise done! " : "🏋️ No exercise today. ");

        // Spending
        if (spent.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("💸 Spent ₹").append(spent.toPlainString()).append(" today. ");
        }

        // Mood
        if (summary.getMood() != null) {
            sb.append("Mood: ").append(summary.getMood().toLowerCase()).append(". ");
        }

        sb.append("Great work today — rest up! 🌙");

        return sb.toString();
    }
}
