package com.tracker.health.repository;

import com.tracker.health.model.entity.ExerciseLog;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {
    List<ExerciseLog> findAllByUserIdAndLogDate(Long userId, LocalDate logDate);
    List<ExerciseLog> findAllByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);
}

