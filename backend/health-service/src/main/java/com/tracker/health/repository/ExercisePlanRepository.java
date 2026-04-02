package com.tracker.health.repository;

import com.tracker.health.model.entity.ExercisePlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercisePlanRepository extends JpaRepository<ExercisePlan, Long> {
    List<ExercisePlan> findAllByUserId(Long userId);

    // Returns the most-recently-created active plan; safe even if duplicates exist in DB
    Optional<ExercisePlan> findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);

    // Used to bulk-deactivate all active plans for a user before activating a new one
    List<ExercisePlan> findAllByUserIdAndIsActiveTrue(Long userId);
}

