package com.tracker.health.model.dto.request;

import com.tracker.health.model.enums.MuscleGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ExerciseLogRequest {
    @PastOrPresent
    private LocalDate logDate;
    @NotBlank
    private String exerciseName;
    private MuscleGroup muscleGroup;
    private Integer setsCompleted;
    private Integer repsCompleted;
    private BigDecimal weightKg;
    private Integer durationMinutes;
    private String notes;
}

