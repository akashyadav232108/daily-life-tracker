package com.tracker.notification.repository;

import com.tracker.notification.model.entity.Streak;
import com.tracker.notification.model.enums.StreakType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StreakRepository extends JpaRepository<Streak, Long> {

    /**
     * Fetch a specific streak record for a user and type.
     * Used by StreakService to read and update the streak on every Kafka event.
     */
    Optional<Streak> findByUserIdAndStreakType(Long userId, StreakType streakType);

    /**
     * Fetch all streak records for a user (all 3 types).
     * Used by GET /api/insights/streaks
     */
    List<Streak> findByUserId(Long userId);

    /**
     * Check whether a streak record exists for a user + type.
     * Used to decide between insert vs update.
     */
    boolean existsByUserIdAndStreakType(Long userId, StreakType streakType);

    /**
     * Fetch all users who have a streak of type EXERCISE (for morning reminder enrichment).
     */
    @Query("SELECT s.userId FROM Streak s WHERE s.streakType = :type AND s.currentCount > 0")
    List<Long> findActiveUserIdsByStreakType(@Param("type") StreakType type);
}
