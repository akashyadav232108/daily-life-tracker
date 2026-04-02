package com.tracker.health.model.dto.response;

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
public class TodayWorkoutResponse {
    private String dayOfWeek;
    private MuscleGroup muscleGroup;
    private String planName;
    private String notes;
    private boolean isRestDay;
    private List<Exercise> exercises;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Exercise {
        private String exerciseName;
        private Integer sets;
        private Integer reps;
    }
}

