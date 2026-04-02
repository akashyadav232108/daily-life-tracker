package com.tracker.health.service;

import com.tracker.health.model.dto.request.CustomMetricLogRequest;
import com.tracker.health.model.dto.request.CustomMetricRequest;
import com.tracker.health.model.dto.response.CustomMetricResponse;
import com.tracker.health.model.entity.CustomMetric;
import com.tracker.health.model.entity.CustomMetricLog;
import com.tracker.health.repository.CustomMetricLogRepository;
import com.tracker.health.repository.CustomMetricRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomMetricService {

    private final CustomMetricRepository customMetricRepository;
    private final CustomMetricLogRepository customMetricLogRepository;

    @CacheEvict(value = "customMetrics", key = "#userId")
    @Transactional
    public CustomMetricResponse createMetric(Long userId, CustomMetricRequest request) {
        CustomMetric metric = CustomMetric.builder()
                .userId(userId)
                .metricName(request.getMetricName())
                .unit(request.getUnit())
                .build();
        CustomMetric saved = customMetricRepository.save(metric);
        return toResponse(saved);
    }

    // Custom metrics rarely change — safe to cache per user for 10 min
    @Cacheable(value = "customMetrics", key = "#userId")
    @Transactional(readOnly = true)
    public List<CustomMetricResponse> getMetrics(Long userId) {
        return customMetricRepository.findAllByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "customMetrics", key = "#userId")
    @Transactional
    public void deleteMetric(Long userId, Long metricId) {
        CustomMetric metric = customMetricRepository.findById(metricId)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Metric not found"));
        customMetricRepository.delete(metric);
    }

    @Transactional
    public void logValue(Long userId, Long metricId, CustomMetricLogRequest request) {
        CustomMetric metric = customMetricRepository.findById(metricId)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Metric not found"));
        LocalDate date = Optional.ofNullable(request.getLogDate()).orElse(LocalDate.now());
        CustomMetricLog log = customMetricLogRepository.findByMetricAndUserIdAndLogDate(metric, userId, date)
                .orElseGet(() -> CustomMetricLog.builder()
                        .metric(metric)
                        .userId(userId)
                        .logDate(date)
                        .build());
        log.setValue(request.getValue());
        customMetricLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<CustomMetricLog> getLogs(Long userId, Long metricId, LocalDate from, LocalDate to) {
        CustomMetric metric = customMetricRepository.findById(metricId)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Metric not found"));
        LocalDate start = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate end = to != null ? to : LocalDate.now();
        return customMetricLogRepository.findAllByMetricAndUserIdAndLogDateBetween(metric, userId, start, end);
    }

    private CustomMetricResponse toResponse(CustomMetric metric) {
        return CustomMetricResponse.builder()
                .id(metric.getId())
                .metricName(metric.getMetricName())
                .unit(metric.getUnit())
                .createdAt(metric.getCreatedAt())
                .build();
    }
}

