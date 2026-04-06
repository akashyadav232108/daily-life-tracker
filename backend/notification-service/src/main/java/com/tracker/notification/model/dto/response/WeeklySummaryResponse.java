package com.tracker.notification.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Response for GET /api/insights/weekly
 * Aggregated from the last 7 days of daily_summaries records.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklySummaryResponse {

    private LocalDate from;
    private LocalDate to;

    /** Total tasks completed across the week */
    private Integer totalTasksCompleted;

    /** Total tasks created/existing across the week */
    private Integer totalTasksTotal;

    /** Number of days health was logged this week (out of 7) */
    private Integer healthLoggedDays;

    /** Number of days exercise was logged this week (out of 7) */
    private Integer exerciseLoggedDays;

    /** Total amount spent across the week */
    private BigDecimal totalSpent;

    /** Current streaks snapshot */
    private List<StreakResponse> streaks;

    /** Per-day breakdown */
    private List<DailySummaryResponse> dailyBreakdown;
}
