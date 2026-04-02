package com.tracker.health.controller;

import com.tracker.health.model.dto.request.ExerciseLogRequest;
import com.tracker.health.model.dto.response.ApiResponse;
import com.tracker.health.model.dto.response.ExerciseLogResponse;
import com.tracker.health.service.ExerciseLogService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises/logs")
@RequiredArgsConstructor
public class ExerciseLogController {

    private final ExerciseLogService exerciseLogService;

    private Long getCurrentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExerciseLogResponse>> logExercise(Authentication auth,
                                                                        @Valid @RequestBody ExerciseLogRequest request) {
        Long userId = getCurrentUserId(auth);
        ExerciseLogResponse resp = exerciseLogService.logExercise(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Exercise logged", resp));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExerciseLogResponse>>> getLogs(Authentication auth,
                                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                                                          @RequestParam(required = false) String view) {
        Long userId = getCurrentUserId(auth);
        LocalDate[] range = resolveRange(from, to, view);
        List<ExerciseLogResponse> list = exerciseLogService.getLogs(userId, range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Exercise logs fetched", list));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<ExerciseLogResponse>>> getTodayLogs(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<ExerciseLogResponse> list = exerciseLogService.getLogsForDate(userId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success("Today's exercise logs", list));
    }

    @GetMapping("/{date}")
    public ResponseEntity<ApiResponse<List<ExerciseLogResponse>>> getLogsForDate(Authentication auth,
                                                                                 @PathVariable String date) {
        Long userId = getCurrentUserId(auth);
        List<ExerciseLogResponse> list = exerciseLogService.getLogsForDate(userId, LocalDate.parse(date));
        return ResponseEntity.ok(ApiResponse.success("Exercise logs for date", list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        exerciseLogService.deleteLog(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Exercise log deleted", null));
    }

    private LocalDate[] resolveRange(LocalDate from, LocalDate to, String view) {
        if (from != null || to != null) {
            return new LocalDate[] {
                    from != null ? from : LocalDate.now().minusDays(30),
                    to != null ? to : LocalDate.now()
            };
        }
        if ("week".equalsIgnoreCase(view)) {
            LocalDate start = LocalDate.now().minusDays(6);
            return new LocalDate[] { start, LocalDate.now() };
        }
        if ("month".equalsIgnoreCase(view)) {
            LocalDate start = LocalDate.now().minusDays(29);
            return new LocalDate[] { start, LocalDate.now() };
        }
        return new LocalDate[] { LocalDate.now().minusDays(30), LocalDate.now() };
    }
}

