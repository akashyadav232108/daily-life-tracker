package com.tracker.health.model.dto.response;

import com.tracker.health.model.enums.Mood;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthLogResponse {
    private Long id;
    private LocalDate logDate;
    private Integer waterGlasses;
    private BigDecimal sleepHours;
    private Integer steps;
    private BigDecimal weightKg;
    private Mood mood;
    private String notes;
    private List<CustomMetricEntry> customMetrics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomMetricEntry {
        private String metricName;
        private BigDecimal value;
        private String unit;
    }
}

