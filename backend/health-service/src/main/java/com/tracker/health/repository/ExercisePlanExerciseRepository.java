package com.tracker.health.repository;

import com.tracker.health.model.entity.ExercisePlanDay;
import com.tracker.health.model.entity.ExercisePlanExercise;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercisePlanExerciseRepository extends JpaRepository<ExercisePlanExercise, Long> {
    List<ExercisePlanExercise> findAllByPlanDayOrderByOrderIndexAsc(ExercisePlanDay planDay);
}

