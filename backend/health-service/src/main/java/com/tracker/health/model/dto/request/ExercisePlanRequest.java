package com.tracker.health.model.dto.request;

import com.tracker.health.model.enums.FitnessGoal;
import com.tracker.health.model.enums.MuscleGroup;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class ExercisePlanRequest {
    @NotBlank
    @Size(max = 100)
    private String planName;

    private FitnessGoal fitnessGoal;

    @Valid
    @Size(min = 1, max = 7)
    private List<PlanDay> days;

    @Data
    public static class PlanDay {
        @NotBlank
        private String dayOfWeek; // MONDAY..SUNDAY
        @NotNull
        private MuscleGroup muscleGroup;
        private String notes;
        @Valid
        private List<PlanExercise> exercises;
    }

    @Data
    public static class PlanExercise {
        @NotBlank
        private String exerciseName;
        private Integer sets;
        private Integer reps;
        private Integer durationMinutes;
        private Integer orderIndex;
    }
}

