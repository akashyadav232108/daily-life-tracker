package com.tracker.notification.model.entity;

import com.tracker.notification.model.enums.StreakType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "streaks",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_streak_user_type", columnNames = {"user_id", "streak_type"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Streak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "streak_type", nullable = false, length = 30)
    private StreakType streakType;

    /** Number of consecutive days in the current active streak */
    @Column(name = "current_count", nullable = false)
    @Builder.Default
    private Integer currentCount = 0;

    /** All-time longest streak ever achieved for this type */
    @Column(name = "longest_count", nullable = false)
    @Builder.Default
    private Integer longestCount = 0;

    /** The last calendar date on which the user was active for this streak type */
    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
