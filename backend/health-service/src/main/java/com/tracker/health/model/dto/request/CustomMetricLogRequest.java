package com.tracker.health.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CustomMetricLogRequest {
    @PastOrPresent
    private LocalDate logDate;
    @NotNull
    private BigDecimal value;
}

