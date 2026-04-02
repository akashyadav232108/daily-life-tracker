package com.tracker.health.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomMetricRequest {
    @NotBlank
    @Size(max = 100)
    private String metricName;
    @Size(max = 50)
    private String unit;
}

