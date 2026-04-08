package com.tracker.health.controller;

import com.tracker.health.model.dto.response.ApiResponse;
import com.tracker.health.model.dto.response.ExerciseLogResponse;
import com.tracker.health.model.dto.response.ExercisePlanResponse;
import com.tracker.health.model.entity.ExerciseLog;
import com.tracker.health.model.entity.ExercisePlan;
import com.tracker.health.model.entity.ExercisePlanDay;
import com.tracker.health.model.entity.ExercisePlanExercise;
import com.tracker.health.repository.ExerciseLogRepository;
import com.tracker.health.repository.ExercisePlanDayRepository;
import com.tracker.health.repository.ExercisePlanExerciseRepository;
import com.tracker.health.repository.ExercisePlanRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminExerciseController {

    private final ExercisePlanRepository exercisePlanRepository;
    private final ExercisePlanDayRepository exercisePlanDayRepository;
    private final ExercisePlanExerciseRepository exercisePlanExerciseRepository;
    private final ExerciseLogRepository exerciseLogRepository;

    // SUPER_ADMIN only — personal exercise plan data
    @GetMapping("/users/{userId}/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExercisePlanResponse>>> getUserPlans(@PathVariable Long userId) {
        List<ExercisePlanResponse> list = exercisePlanRepository.findAllByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User exercise plans", list));
    }

    // SUPER_ADMIN only — personal exercise log data
    @GetMapping("/users/{userId}/logs")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExerciseLogResponse>>> getUserLogs(@PathVariable Long userId) {
        List<ExerciseLogResponse> list = exerciseLogRepository.findAll().stream()
                .filter(l -> l.getUserId().equals(userId))
                .map(this::toLogResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User exercise logs", list));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        long activePlans = exercisePlanRepository.findAll().stream().filter(ExercisePlan::isActive).count();
        Map<String, Long> popularMuscleGroups = exercisePlanDayRepository.findAll().stream()
                .filter(d -> d.getMuscleGroup() != null)
                .collect(Collectors.groupingBy(d -> d.getMuscleGroup().name(), Collectors.counting()));
        Map<String, Object> data = Map.of(
                "activePlans", activePlans,
                "popularMuscleGroups", popularMuscleGroups
        );
        return ResponseEntity.ok(ApiResponse.success("Exercise platform stats", data));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnyPlan(@PathVariable Long id) {
        exercisePlanRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Exercise plan deleted", null));
    }

    @DeleteMapping("/logs/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnyLog(@PathVariable Long id) {
        exerciseLogRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Exercise log deleted", null));
    }

    private ExercisePlanResponse toResponse(ExercisePlan plan) {
        List<ExercisePlanDay> days = exercisePlanDayRepository.findAllByPlan(plan);
        return ExercisePlanResponse.builder()
                .id(plan.getId())
                .planName(plan.getPlanName())
                .fitnessGoal(plan.getFitnessGoal())
                .isActive(plan.isActive())
                .days(days.stream().map(d -> ExercisePlanResponse.PlanDay.builder()
                        .dayOfWeek(d.getDayOfWeek())
                        .muscleGroup(d.getMuscleGroup())
                        .notes(d.getNotes())
                        .exercises(
                                exercisePlanExerciseRepository.findAllByPlanDayOrderByOrderIndexAsc(d).stream()
                                        .map(ex -> ExercisePlanResponse.PlanExercise.builder()
                                                .exerciseName(ex.getExerciseName())
                                                .sets(ex.getSets())
                                                .reps(ex.getReps())
                                                .durationMinutes(ex.getDurationMinutes())
                                                .build())
                                        .collect(Collectors.toList())
                        )
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private ExerciseLogResponse toLogResponse(ExerciseLog log) {
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

