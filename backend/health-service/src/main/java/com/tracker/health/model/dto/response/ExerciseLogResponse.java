package com.tracker.health.model.dto.response;

import com.tracker.health.model.enums.MuscleGroup;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseLogResponse {
    private Long id;
    private LocalDate logDate;
    private String exerciseName;
    private MuscleGroup muscleGroup;
    private Integer setsCompleted;
    private Integer repsCompleted;
    private BigDecimal weightKg;
    private Integer durationMinutes;
    private String notes;
}

