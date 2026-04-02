package com.tracker.health.model.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomMetricResponse {
    private Long id;
    private String metricName;
    private String unit;
    private LocalDateTime createdAt;
}

