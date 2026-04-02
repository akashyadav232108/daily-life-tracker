package com.tracker.health.service;

import com.tracker.health.model.dto.request.ExercisePlanRequest;
import com.tracker.health.model.dto.response.ExercisePlanResponse;
import com.tracker.health.model.dto.response.TodayWorkoutResponse;
import com.tracker.health.model.entity.ExercisePlan;
import com.tracker.health.model.entity.ExercisePlanDay;
import com.tracker.health.model.entity.ExercisePlanExercise;
import com.tracker.health.model.enums.MuscleGroup;
import com.tracker.health.repository.ExercisePlanDayRepository;
import com.tracker.health.repository.ExercisePlanExerciseRepository;
import com.tracker.health.repository.ExercisePlanRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExercisePlanService {

    private final ExercisePlanRepository exercisePlanRepository;
    private final ExercisePlanDayRepository exercisePlanDayRepository;
    private final ExercisePlanExerciseRepository exercisePlanExerciseRepository;

    @Transactional
    public ExercisePlanResponse createPlan(Long userId, ExercisePlanRequest request) {
        // Deactivate ALL currently active plans for this user before creating a new active one
        exercisePlanRepository.findAllByUserIdAndIsActiveTrue(userId).forEach(p -> {
            p.setActive(false);
            exercisePlanRepository.save(p);
        });

        ExercisePlan plan = ExercisePlan.builder()
                .userId(userId)
                .planName(request.getPlanName())
                .fitnessGoal(request.getFitnessGoal())
                .isActive(true)
                .build();
        ExercisePlan savedPlan = exercisePlanRepository.save(plan);

        if (request.getDays() != null) {
            for (ExercisePlanRequest.PlanDay dayReq : request.getDays()) {
                ExercisePlanDay day = ExercisePlanDay.builder()
                        .plan(savedPlan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .muscleGroup(dayReq.getMuscleGroup())
                        .notes(dayReq.getNotes())
                        .build();
                ExercisePlanDay savedDay = exercisePlanDayRepository.save(day);

                if (dayReq.getExercises() != null) {
                    for (ExercisePlanRequest.PlanExercise exReq : dayReq.getExercises()) {
                        ExercisePlanExercise ex = ExercisePlanExercise.builder()
                                .planDay(savedDay)
                                .exerciseName(exReq.getExerciseName())
                                .sets(exReq.getSets())
                                .reps(exReq.getReps())
                                .durationMinutes(exReq.getDurationMinutes())
                                .orderIndex(exReq.getOrderIndex())
                                .build();
                        exercisePlanExerciseRepository.save(ex);
                    }
                }
            }
        }

        return toResponseWithChildren(savedPlan);
    }

    @Transactional(readOnly = true)
    public List<ExercisePlanResponse> getPlans(Long userId) {
        return exercisePlanRepository.findAllByUserId(userId).stream()
                .sorted(Comparator.comparing(ExercisePlan::isActive).reversed()
                        .thenComparing(ExercisePlan::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponseWithChildren)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ExercisePlanResponse> getActivePlan(Long userId) {
        return exercisePlanRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .map(this::toResponseWithChildren);
    }

    @Transactional(readOnly = true)
    public Optional<ExercisePlanResponse> getPlan(Long userId, Long planId) {
        return exercisePlanRepository.findById(planId)
                .filter(p -> p.getUserId().equals(userId))
                .map(this::toResponseWithChildren);
    }

    @Transactional
    public ExercisePlanResponse updatePlan(Long userId, Long planId, ExercisePlanRequest request) {
        ExercisePlan plan = exercisePlanRepository.findById(planId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        plan.setPlanName(request.getPlanName());
        plan.setFitnessGoal(request.getFitnessGoal());

        // Replace children (simple approach)
        List<ExercisePlanDay> existingDays = exercisePlanDayRepository.findAllByPlan(plan);
        existingDays.forEach(d -> {
            List<ExercisePlanExercise> exs = exercisePlanExerciseRepository.findAllByPlanDayOrderByOrderIndexAsc(d);
            exs.forEach(exercisePlanExerciseRepository::delete);
            exercisePlanDayRepository.delete(d);
        });

        if (request.getDays() != null) {
            for (ExercisePlanRequest.PlanDay dayReq : request.getDays()) {
                ExercisePlanDay day = ExercisePlanDay.builder()
                        .plan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .muscleGroup(dayReq.getMuscleGroup())
                        .notes(dayReq.getNotes())
                        .build();
                ExercisePlanDay savedDay = exercisePlanDayRepository.save(day);

                if (dayReq.getExercises() != null) {
                    for (ExercisePlanRequest.PlanExercise exReq : dayReq.getExercises()) {
                        ExercisePlanExercise ex = ExercisePlanExercise.builder()
                                .planDay(savedDay)
                                .exerciseName(exReq.getExerciseName())
                                .sets(exReq.getSets())
                                .reps(exReq.getReps())
                                .durationMinutes(exReq.getDurationMinutes())
                                .orderIndex(exReq.getOrderIndex())
                                .build();
                        exercisePlanExerciseRepository.save(ex);
                    }
                }
            }
        }

        return toResponseWithChildren(plan);
    }

    @Transactional
    public void deletePlan(Long userId, Long planId) {
        ExercisePlan plan = exercisePlanRepository.findById(planId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        exercisePlanRepository.delete(plan);
    }

    @Transactional
    public void activatePlan(Long userId, Long planId) {
        ExercisePlan plan = exercisePlanRepository.findById(planId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        // Deactivate others
        exercisePlanRepository.findAllByUserId(userId).forEach(p -> {
            if (!Objects.equals(p.getId(), plan.getId()) && p.isActive()) {
                p.setActive(false);
                exercisePlanRepository.save(p);
            }
        });

        // Activate this plan
        plan.setActive(true);
        exercisePlanRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public TodayWorkoutResponse getTodayPlannedExercises(Long userId) {
        ExercisePlan active = exercisePlanRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new IllegalArgumentException("No active plan found"));
        DayOfWeek dow = LocalDate.now().getDayOfWeek();
        String today = dow.name();

        ExercisePlanDay day = exercisePlanDayRepository.findByPlanAndDayOfWeek(active, today)
                .orElse(null);

        if (day == null) {
            return TodayWorkoutResponse.builder()
                    .dayOfWeek(today)
                    .planName(active.getPlanName())
                    .isRestDay(true)
                    .exercises(List.of())
                    .build();
        }

        boolean isRest = day.getMuscleGroup() == MuscleGroup.REST;
        List<ExercisePlanExercise> exercises = exercisePlanExerciseRepository.findAllByPlanDayOrderByOrderIndexAsc(day);

        return TodayWorkoutResponse.builder()
                .dayOfWeek(day.getDayOfWeek())
                .muscleGroup(day.getMuscleGroup())
                .planName(active.getPlanName())
                .notes(day.getNotes())
                .isRestDay(isRest)
                .exercises(exercises.stream()
                        .map(ex -> TodayWorkoutResponse.Exercise.builder()
                                .exerciseName(ex.getExerciseName())
                                .sets(ex.getSets())
                                .reps(ex.getReps())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private ExercisePlanResponse toResponseWithChildren(ExercisePlan plan) {
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
}

