package com.tracker.health.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyHealthSummaryResponse {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private BigDecimal avgWaterGlasses;
    private BigDecimal avgSleepHours;
    private BigDecimal avgSteps;
    private Integer daysLogged;
    private Map<String, Integer> moodDistribution;
}

