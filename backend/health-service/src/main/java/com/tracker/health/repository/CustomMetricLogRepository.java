package com.tracker.health.repository;

import com.tracker.health.model.entity.CustomMetric;
import com.tracker.health.model.entity.CustomMetricLog;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomMetricLogRepository extends JpaRepository<CustomMetricLog, Long> {
    Optional<CustomMetricLog> findByMetricAndUserIdAndLogDate(CustomMetric metric, Long userId, LocalDate logDate);
    List<CustomMetricLog> findAllByMetricAndUserIdAndLogDateBetween(CustomMetric metric, Long userId, LocalDate from, LocalDate to);
}

