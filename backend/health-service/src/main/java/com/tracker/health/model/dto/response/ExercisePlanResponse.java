package com.tracker.health.model.dto.response;

import com.tracker.health.model.enums.FitnessGoal;
import com.tracker.health.model.enums.MuscleGroup;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExercisePlanResponse {
    private Long id;
    private String planName;
    private FitnessGoal fitnessGoal;
    private boolean isActive;
    private List<PlanDay> days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanDay {
        private String dayOfWeek;
        private MuscleGroup muscleGroup;
        private String notes;
        private List<PlanExercise> exercises;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanExercise {
        private String exerciseName;
        private Integer sets;
        private Integer reps;
        private Integer durationMinutes;
    }
}

