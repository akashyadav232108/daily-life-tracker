package com.tracker.notification.model.dto.response;

import com.tracker.notification.model.entity.DailySummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Response for GET /api/insights/today
 * Aggregated from the daily_summaries table (built from Kafka events throughout the day).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummaryResponse {

    private LocalDate date;

    private TasksSummary tasks;
    private HealthSummary health;
    private ExerciseSummary exercise;
    private ExpensesSummary expenses;

    // ── Nested sub-objects ──────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TasksSummary {
        private Integer total;
        private Integer completed;
        private Integer pending;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthSummary {
        private Boolean logged;
        private String mood;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExerciseSummary {
        private Boolean logged;
        private String muscleGroup;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpensesSummary {
        private BigDecimal totalSpent;
    }

    /** Build a DailySummaryResponse from the entity. streaks are added separately by the service. */
    public static DailySummaryResponse fromEntity(DailySummary summary) {
        int completed = summary.getTasksCompleted() != null ? summary.getTasksCompleted() : 0;
        int total     = summary.getTasksTotal()     != null ? summary.getTasksTotal()     : 0;
        int pending   = Math.max(0, total - completed);

        return DailySummaryResponse.builder()
                .date(summary.getSummaryDate())
                .tasks(TasksSummary.builder()
                        .total(total)
                        .completed(completed)
                        .pending(pending)
                        .build())
                .health(HealthSummary.builder()
                        .logged(summary.getHealthLogged())
                        .mood(summary.getMood())
                        .build())
                .exercise(ExerciseSummary.builder()
                        .logged(summary.getExerciseLogged())
                        .build())
                .expenses(ExpensesSummary.builder()
                        .totalSpent(summary.getTotalSpent())
                        .build())
                .build();
    }
}
