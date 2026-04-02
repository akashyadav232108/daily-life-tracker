package com.tracker.health.repository;

import com.tracker.health.model.entity.ExercisePlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercisePlanRepository extends JpaRepository<ExercisePlan, Long> {
    List<ExercisePlan> findAllByUserId(Long userId);
    Optional<ExercisePlan> findByUserIdAndIsActiveTrue(Long userId);
}

