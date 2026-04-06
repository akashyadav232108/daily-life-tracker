package com.tracker.notification.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "daily_summaries",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_daily_summary_user_date", columnNames = {"user_id", "summary_date"})
    },
    indexes = {
        @Index(name = "idx_daily_summaries_user", columnList = "user_id, summary_date")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    /** Total tasks created/existing for this day */
    @Column(name = "tasks_total", nullable = false)
    @Builder.Default
    private Integer tasksTotal = 0;

    /** Tasks marked completed on this day */
    @Column(name = "tasks_completed", nullable = false)
    @Builder.Default
    private Integer tasksCompleted = 0;

    /** True if a health log (vitals/mood) was submitted today */
    @Column(name = "health_logged", nullable = false)
    @Builder.Default
    private Boolean healthLogged = false;

    /** True if at least one exercise was logged today */
    @Column(name = "exercise_logged", nullable = false)
    @Builder.Default
    private Boolean exerciseLogged = false;

    /** Total amount spent today across all expense categories */
    @Column(name = "total_spent", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    /** Mood from today's health log (e.g. GOOD, FAIR, POOR) */
    @Column(name = "mood", length = 15)
    private String mood;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
