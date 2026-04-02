package com.tracker.health.controller;

import com.tracker.health.model.dto.response.ApiResponse;
import com.tracker.health.model.dto.response.HealthLogResponse;
import com.tracker.health.model.entity.HealthLog;
import com.tracker.health.repository.HealthLogRepository;
import java.time.LocalDate;
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
@RequestMapping("/api/health/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminHealthController {

    private final HealthLogRepository healthLogRepository;

    @GetMapping("/users/{userId}/logs")
    public ResponseEntity<ApiResponse<List<HealthLogResponse>>> getUserLogs(@PathVariable Long userId) {
        List<HealthLogResponse> list = healthLogRepository
                .findAllByUserIdAndLogDateBetween(userId, LocalDate.now().minusDays(30), LocalDate.now())
                .stream()
                .map(h -> HealthLogResponse.builder()
                        .id(h.getId())
                        .logDate(h.getLogDate())
                        .waterGlasses(h.getWaterGlasses())
                        .sleepHours(h.getSleepHours())
                        .steps(h.getSteps())
                        .weightKg(h.getWeightKg())
                        .mood(h.getMood())
                        .notes(h.getNotes())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User health logs", list));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        // Simple placeholder stats using last 7 days
        LocalDate start = LocalDate.now().minusDays(6);
        List<HealthLog> logs = healthLogRepository.findAll().stream()
                .filter(l -> !l.getLogDate().isBefore(start))
                .collect(Collectors.toList());

        long totalLogs = logs.size();
        long activeLoggers = logs.stream().map(HealthLog::getUserId).distinct().count();
        Map<String, Long> moodDist = logs.stream()
                .filter(l -> l.getMood() != null)
                .collect(Collectors.groupingBy(l -> l.getMood().name(), Collectors.counting()));

        Map<String, Object> data = Map.of(
                "totalLogs7d", totalLogs,
                "activeLoggers7d", activeLoggers,
                "moodDistribution7d", moodDist
        );
        return ResponseEntity.ok(ApiResponse.success("Platform health stats", data));
    }

    @DeleteMapping("/logs/{logId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnyLog(@PathVariable Long logId) {
        healthLogRepository.deleteById(logId);
        return ResponseEntity.ok(ApiResponse.success("Health log deleted", null));
    }
}

