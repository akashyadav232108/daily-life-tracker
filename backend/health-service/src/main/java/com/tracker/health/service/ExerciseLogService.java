package com.tracker.health.service;

import com.tracker.health.model.dto.request.ExerciseLogRequest;
import com.tracker.health.model.dto.response.ExerciseLogResponse;
import com.tracker.health.model.entity.ExerciseLog;
import com.tracker.health.repository.ExerciseLogRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExerciseLogService {

    private final ExerciseLogRepository exerciseLogRepository;

    @Transactional
    public ExerciseLogResponse logExercise(Long userId, ExerciseLogRequest request) {
        ExerciseLog log = ExerciseLog.builder()
                .userId(userId)
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now())
                .exerciseName(request.getExerciseName())
                .muscleGroup(request.getMuscleGroup())
                .setsCompleted(request.getSetsCompleted())
                .repsCompleted(request.getRepsCompleted())
                .weightKg(request.getWeightKg())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .build();
        ExerciseLog saved = exerciseLogRepository.save(log);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExerciseLogResponse> getLogs(Long userId, LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate end = to != null ? to : LocalDate.now();
        return exerciseLogRepository.findAllByUserIdAndLogDateBetween(userId, start, end).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExerciseLogResponse> getLogsForDate(Long userId, LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        return exerciseLogRepository.findAllByUserIdAndLogDate(userId, d).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLog(Long userId, Long logId) {
        ExerciseLog log = exerciseLogRepository.findById(logId)
                .filter(l -> l.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Log not found"));
        exerciseLogRepository.delete(log);
    }

    private ExerciseLogResponse toResponse(ExerciseLog log) {
        return ExerciseLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .exerciseName(log.getExerciseName())
                .muscleGroup(log.getMuscleGroup())
                .setsCompleted(log.getSetsCompleted())
                .repsCompleted(log.getRepsCompleted())
                .weightKg(log.getWeightKg())
                .durationMinutes(log.getDurationMinutes())
                .notes(log.getNotes())
                .build();
    }
}

