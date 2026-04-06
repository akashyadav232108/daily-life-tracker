package com.tracker.notification.repository;

import com.tracker.notification.model.entity.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, Long> {

    /**
     * Fetch today's summary for a specific user.
     * Used by GET /api/insights/today and the evening scheduler.
     */
    Optional<DailySummary> findByUserIdAndSummaryDate(Long userId, LocalDate summaryDate);

    /**
     * Fetch summaries for a user within a date range (for weekly summary).
     * Used by GET /api/insights/weekly
     */
    List<DailySummary> findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(
            Long userId, LocalDate from, LocalDate to);

    /**
     * Get all distinct user IDs that have any summary record.
     * Used by the evening scheduler to send summaries to all active users.
     */
    @Query("SELECT DISTINCT d.userId FROM DailySummary d")
    List<Long> findDistinctUserIds();

    /**
     * Get all distinct user IDs active within the last N days.
     * Used by the morning reminder job to notify recently active users only.
     */
    @Query("""
            SELECT DISTINCT d.userId FROM DailySummary d
            WHERE d.summaryDate >= :since
            """)
    List<Long> findDistinctUserIdsSince(@Param("since") LocalDate since);

    /**
     * Check if a summary for today already exists for this user (for upsert logic).
     */
    boolean existsByUserIdAndSummaryDate(Long userId, LocalDate summaryDate);
}
