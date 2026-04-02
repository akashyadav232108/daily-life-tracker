package com.tracker.health.service;

import com.tracker.health.model.dto.request.CustomMetricLogRequest;
import com.tracker.health.model.dto.request.HealthLogRequest;
import com.tracker.health.model.dto.response.HealthLogResponse;
import com.tracker.health.model.dto.response.WeeklyHealthSummaryResponse;
import com.tracker.health.model.entity.CustomMetric;
import com.tracker.health.model.entity.CustomMetricLog;
import com.tracker.health.model.entity.HealthLog;
import com.tracker.health.repository.CustomMetricLogRepository;
import com.tracker.health.repository.CustomMetricRepository;
import com.tracker.health.repository.HealthLogRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HealthLogService {

    private final HealthLogRepository healthLogRepository;
    private final CustomMetricRepository customMetricRepository;
    private final CustomMetricLogRepository customMetricLogRepository;

    @Transactional
    public HealthLogResponse upsertHealthLog(Long userId, HealthLogRequest request) {
        LocalDate date = Optional.ofNullable(request.getLogDate()).orElse(LocalDate.now());
        HealthLog log = healthLogRepository.findByUserIdAndLogDate(userId, date)
                .orElseGet(() -> HealthLog.builder().userId(userId).logDate(date).build());

        log.setWaterGlasses(request.getWaterGlasses());
        log.setSleepHours(request.getSleepHours());
        log.setSteps(request.getSteps());
        log.setWeightKg(request.getWeightKg());
        log.setMood(request.getMood());
        log.setNotes(request.getNotes());

        HealthLog saved = healthLogRepository.save(log);
        return toHealthLogResponseWithCustomMetrics(saved, userId);
    }

    @Transactional(readOnly = true)
    public List<HealthLogResponse> getHealthLogs(Long userId, LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate end = to != null ? to : LocalDate.now();
        return healthLogRepository.findAllByUserIdAndLogDateBetween(userId, start, end).stream()
                .sorted(Comparator.comparing(HealthLog::getLogDate).reversed())
                .map(log -> toHealthLogResponseWithCustomMetrics(log, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<HealthLogResponse> getTodayLog(Long userId) {
        return healthLogRepository.findByUserIdAndLogDate(userId, LocalDate.now())
                .map(log -> toHealthLogResponseWithCustomMetrics(log, userId));
    }

    @Transactional(readOnly = true)
    public Optional<HealthLogResponse> getLogForDate(Long userId, LocalDate date) {
        return healthLogRepository.findByUserIdAndLogDate(userId, date)
                .map(log -> toHealthLogResponseWithCustomMetrics(log, userId));
    }

    @Transactional(readOnly = true)
    public WeeklyHealthSummaryResponse getWeeklySummary(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);

        List<HealthLog> logs = healthLogRepository.findAllByUserIdAndLogDateBetween(userId, weekStart, weekEnd);
        int daysLogged = logs.size();

        BigDecimal avgWater = averageOfIntegers(logs.stream().map(HealthLog::getWaterGlasses).filter(Objects::nonNull).toList());
        BigDecimal avgSleep = averageOfDecimals(logs.stream().map(HealthLog::getSleepHours).filter(Objects::nonNull).toList());
        BigDecimal avgSteps = averageOfIntegers(logs.stream().map(HealthLog::getSteps).filter(Objects::nonNull).toList());

        Map<String, Integer> moodDistribution = logs.stream()
                .map(HealthLog::getMood)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Enum::name, Collectors.summingInt(m -> 1)));

        return WeeklyHealthSummaryResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .avgWaterGlasses(avgWater)
                .avgSleepHours(avgSleep)
                .avgSteps(avgSteps)
                .daysLogged(daysLogged)
                .moodDistribution(moodDistribution)
                .build();
    }

    @Transactional
    public void logCustomMetricValue(Long userId, Long metricId, CustomMetricLogRequest request) {
        CustomMetric metric = customMetricRepository.findById(metricId)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Metric not found"));

        LocalDate date = Optional.ofNullable(request.getLogDate()).orElse(LocalDate.now());
        Optional<CustomMetricLog> existing = customMetricLogRepository.findByMetricAndUserIdAndLogDate(metric, userId, date);
        CustomMetricLog log = existing.orElseGet(() -> CustomMetricLog.builder()
                .metric(metric)
                .userId(userId)
                .logDate(date)
                .build());
        log.setValue(request.getValue());
        customMetricLogRepository.save(log);
    }

    private HealthLogResponse toHealthLogResponseWithCustomMetrics(HealthLog log, Long userId) {
        List<CustomMetric> metrics = customMetricRepository.findAllByUserId(userId);
        List<HealthLogResponse.CustomMetricEntry> entries = metrics.stream()
                .map(metric -> customMetricLogRepository.findByMetricAndUserIdAndLogDate(metric, userId, log.getLogDate())
                        .map(metricLog -> HealthLogResponse.CustomMetricEntry.builder()
                                .metricName(metric.getMetricName())
                                .value(metricLog.getValue())
                                .unit(metric.getUnit())
                                .build())
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();

        return HealthLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .waterGlasses(log.getWaterGlasses())
                .sleepHours(log.getSleepHours())
                .steps(log.getSteps())
                .weightKg(log.getWeightKg())
                .mood(log.getMood())
                .notes(log.getNotes())
                .customMetrics(entries)
                .build();
    }

    private BigDecimal averageOfIntegers(List<Integer> values) {
        if (values == null || values.isEmpty()) return BigDecimal.ZERO;
        int sum = values.stream().mapToInt(Integer::intValue).sum();
        return BigDecimal.valueOf(sum)
                .divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal averageOfDecimals(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }
}

