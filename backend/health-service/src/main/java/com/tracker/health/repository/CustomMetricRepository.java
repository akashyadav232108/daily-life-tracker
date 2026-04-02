package com.tracker.health.repository;

import com.tracker.health.model.entity.CustomMetric;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomMetricRepository extends JpaRepository<CustomMetric, Long> {
    List<CustomMetric> findAllByUserId(Long userId);
}

