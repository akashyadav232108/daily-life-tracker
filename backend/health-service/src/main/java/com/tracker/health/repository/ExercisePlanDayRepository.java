package com.tracker.health.repository;

import com.tracker.health.model.entity.ExercisePlan;
import com.tracker.health.model.entity.ExercisePlanDay;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercisePlanDayRepository extends JpaRepository<ExercisePlanDay, Long> {
    List<ExercisePlanDay> findAllByPlan(ExercisePlan plan);
    Optional<ExercisePlanDay> findByPlanAndDayOfWeek(ExercisePlan plan, String dayOfWeek);
}

