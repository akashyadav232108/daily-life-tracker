package com.tracker.notification.service;

import com.tracker.notification.model.dto.response.DailySummaryResponse;
import com.tracker.notification.model.dto.response.StreakResponse;
import com.tracker.notification.model.dto.response.WeeklySummaryResponse;
import com.tracker.notification.model.entity.DailySummary;
import com.tracker.notification.repository.DailySummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final DailySummaryRepository dailySummaryRepository;
    private final StreakService streakService;

    // ══════════════════════════════════════════════════════════
    //  USER API
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/insights/today — today's aggregated summary + current streaks.
     * Data is built incrementally from Kafka events throughout the day.
     */
    public DailySummaryResponse getTodaySummary(Long userId) {
        LocalDate today = LocalDate.now();
        DailySummary summary = getOrCreateSummary(userId, today);

        DailySummaryResponse response = DailySummaryResponse.fromEntity(summary);

        // Inject streak counts into exercise/health fields
        int healthStreak   = streakService.getCurrentStreak(userId, com.tracker.notification.model.enums.StreakType.HEALTH_LOG);
        int taskStreak     = streakService.getCurrentStreak(userId, com.tracker.notification.model.enums.StreakType.TASK_COMPLETE);
        int exerciseStreak = streakService.getCurrentStreak(userId, com.tracker.notification.model.enums.StreakType.EXERCISE);

        response.setStreaks(new DailySummaryResponse.StreaksSummary(healthStreak, taskStreak, exerciseStreak));

        return response;
    }

    /**
     * GET /api/insights/weekly — last 7 days aggregate summary + per-day breakdown.
     */
    public WeeklySummaryResponse getWeeklySummary(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6); // last 7 days inclusive

        List<DailySummary> summaries = dailySummaryRepository
                .findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(userId, weekStart, today);

        // Aggregate totals
        int totalTasksCompleted = summaries.stream().mapToInt(s -> s.getTasksCompleted() != null ? s.getTasksCompleted() : 0).sum();
        int totalTasksTotal     = summaries.stream().mapToInt(s -> s.getTasksTotal()     != null ? s.getTasksTotal()     : 0).sum();
        int healthLoggedDays    = (int) summaries.stream().filter(s -> Boolean.TRUE.equals(s.getHealthLogged())).count();
        int exerciseLoggedDays  = (int) summaries.stream().filter(s -> Boolean.TRUE.equals(s.getExerciseLogged())).count();
        BigDecimal totalSpent   = summaries.stream()
                .map(s -> s.getTotalSpent() != null ? s.getTotalSpent() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Per-day breakdown
        List<DailySummaryResponse> dailyBreakdown = summaries.stream()
                .map(DailySummaryResponse::fromEntity)
                .toList();

        // Current streak snapshot
        List<StreakResponse> streaks = streakService.getStreaksForUser(userId);

        return WeeklySummaryResponse.builder()
                .from(weekStart)
                .to(today)
                .totalTasksCompleted(totalTasksCompleted)
                .totalTasksTotal(totalTasksTotal)
                .healthLoggedDays(healthLoggedDays)
                .exerciseLoggedDays(exerciseLoggedDays)
                .totalSpent(totalSpent)
                .streaks(streaks)
                .dailyBreakdown(dailyBreakdown)
                .build();
    }

    // ══════════════════════════════════════════════════════════
    //  INTERNAL — called by Kafka consumers to update daily summary
    // ══════════════════════════════════════════════════════════

    /**
     * TASK_CREATED → increment tasks_total.
     */
    @Transactional
    public void onTaskCreated(Long userId) {
        DailySummary summary = getOrCreateSummary(userId, LocalDate.now());
        summary.setTasksTotal(summary.getTasksTotal() + 1);
        dailySummaryRepository.save(summary);
        log.debug("Daily summary updated: user={} tasksTotal={}", userId, summary.getTasksTotal());
    }

    /**
     * TASK_COMPLETED → increment tasks_completed.
     */
    @Transactional
    public void onTaskCompleted(Long userId) {
        DailySummary summary = getOrCreateSummary(userId, LocalDate.now());
        summary.setTasksCompleted(summary.getTasksCompleted() + 1);
        dailySummaryRepository.save(summary);
        log.debug("Daily summary updated: user={} tasksCompleted={}", userId, summary.getTasksCompleted());
    }

    /**
     * HEALTH_LOGGED → set health_logged = true, store mood.
     */
    @Transactional
    public void onHealthLogged(Long userId, String mood) {
        DailySummary summary = getOrCreateSummary(userId, LocalDate.now());
        summary.setHealthLogged(true);
        if (mood != null) {
            summary.setMood(mood);
        }
        dailySummaryRepository.save(summary);
        log.debug("Daily summary updated: user={} healthLogged=true mood={}", userId, mood);
    }

    /**
     * EXERCISE_LOGGED → set exercise_logged = true.
     */
    @Transactional
    public void onExerciseLogged(Long userId) {
        DailySummary summary = getOrCreateSummary(userId, LocalDate.now());
        summary.setExerciseLogged(true);
        dailySummaryRepository.save(summary);
        log.debug("Daily summary updated: user={} exerciseLogged=true", userId);
    }

    /**
     * EXPENSE_ADDED → add to total_spent.
     */
    @Transactional
    public void onExpenseAdded(Long userId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;
        DailySummary summary = getOrCreateSummary(userId, LocalDate.now());
        summary.setTotalSpent(summary.getTotalSpent().add(amount));
        dailySummaryRepository.save(summary);
        log.debug("Daily summary updated: user={} totalSpent={}", userId, summary.getTotalSpent());
    }

    /**
     * Get all distinct user IDs that have a daily summary record.
     * Used by schedulers to iterate over all active users.
     */
    public List<Long> getAllActiveUserIds() {
        return dailySummaryRepository.findDistinctUserIds();
    }

    /**
     * Get today's summary for a user — used directly by schedulers for email content.
     */
    public DailySummary getSummaryEntity(Long userId, LocalDate date) {
        return getOrCreateSummary(userId, date);
    }

    // ══════════════════════════════════════════════════════════
    //  PRIVATE
    // ══════════════════════════════════════════════════════════

    /**
     * Get existing daily summary or create a blank one for today.
     * Uses save-on-create so partial updates work correctly.
     */
    private DailySummary getOrCreateSummary(Long userId, LocalDate date) {
        return dailySummaryRepository.findByUserIdAndSummaryDate(userId, date)
                .orElseGet(() -> {
                    DailySummary blank = DailySummary.builder()
                            .userId(userId)
                            .summaryDate(date)
                            .tasksTotal(0)
                            .tasksCompleted(0)
                            .healthLogged(false)
                            .exerciseLogged(false)
                            .totalSpent(BigDecimal.ZERO)
                            .build();
                    return dailySummaryRepository.save(blank);
                });
    }
}
