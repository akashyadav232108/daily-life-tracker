package com.tracker.health.repository;

import com.tracker.health.model.entity.HealthLog;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthLogRepository extends JpaRepository<HealthLog, Long> {
    Optional<HealthLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
    List<HealthLog> findAllByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);
    boolean existsByUserIdAndLogDate(Long userId, LocalDate logDate);
}

