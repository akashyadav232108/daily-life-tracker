package com.tracker.health.controller;

import com.tracker.health.model.dto.request.ExercisePlanRequest;
import com.tracker.health.model.dto.response.ApiResponse;
import com.tracker.health.model.dto.response.ExercisePlanResponse;
import com.tracker.health.model.dto.response.TodayWorkoutResponse;
import com.tracker.health.service.ExercisePlanService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises/plans")
@RequiredArgsConstructor
public class ExercisePlanController {

    private final ExercisePlanService exercisePlanService;

    private Long getCurrentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExercisePlanResponse>> createPlan(Authentication auth,
                                                                        @Valid @RequestBody ExercisePlanRequest request) {
        Long userId = getCurrentUserId(auth);
        ExercisePlanResponse resp = exercisePlanService.createPlan(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Exercise plan created", resp));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExercisePlanResponse>>> getPlans(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<ExercisePlanResponse> list = exercisePlanService.getPlans(userId);
        return ResponseEntity.ok(ApiResponse.success("Exercise plans fetched", list));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ExercisePlanResponse>> getActivePlan(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        return exercisePlanService.getActivePlan(userId)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Active plan", p)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("No active plan", "NOT_FOUND")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExercisePlanResponse>> getPlan(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return exercisePlanService.getPlan(userId, id)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Plan", p)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Plan not found", "NOT_FOUND")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExercisePlanResponse>> updatePlan(Authentication auth,
                                                                        @PathVariable Long id,
                                                                        @Valid @RequestBody ExercisePlanRequest request) {
        Long userId = getCurrentUserId(auth);
        ExercisePlanResponse resp = exercisePlanService.updatePlan(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Plan updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        exercisePlanService.deletePlan(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Plan deleted", null));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activatePlan(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        exercisePlanService.activatePlan(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Plan activated", null));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<TodayWorkoutResponse>> getToday(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        TodayWorkoutResponse resp = exercisePlanService.getTodayPlannedExercises(userId);
        return ResponseEntity.ok(ApiResponse.success("Today's planned workout", resp));
    }
}

