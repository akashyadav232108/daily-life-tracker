package com.tracker.health.model.dto.request;

import com.tracker.health.model.enums.Mood;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class HealthLogRequest {
    @PastOrPresent
    private LocalDate logDate;
    private Integer waterGlasses;
    private BigDecimal sleepHours;
    private Integer steps;
    private BigDecimal weightKg;
    private Mood mood;
    private String notes;
}

