package com.tracker.health.controller;

import com.tracker.health.model.dto.request.CustomMetricLogRequest;
import com.tracker.health.model.dto.request.CustomMetricRequest;
import com.tracker.health.model.dto.request.HealthLogRequest;
import com.tracker.health.model.dto.response.ApiResponse;
import com.tracker.health.model.dto.response.CustomMetricResponse;
import com.tracker.health.model.dto.response.HealthLogResponse;
import com.tracker.health.model.dto.response.WeeklyHealthSummaryResponse;
import com.tracker.health.service.CustomMetricService;
import com.tracker.health.service.HealthLogService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
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
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthLogController {

    private final HealthLogService healthLogService;
    private final CustomMetricService customMetricService;

    private Long getCurrentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    // ── Health Logs ──────────────────────────────────────────────────────────────

    @PostMapping("/logs")
    public ResponseEntity<ApiResponse<HealthLogResponse>> upsertHealthLog(Authentication auth,
                                                                          @Valid @RequestBody HealthLogRequest request) {
        Long userId = getCurrentUserId(auth);
        HealthLogResponse response = healthLogService.upsertHealthLog(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Health log saved", response));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<HealthLogResponse>>> getHealthLogs(Authentication auth,
                                                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                                                              @RequestParam(required = false) String view) {
        Long userId = getCurrentUserId(auth);
        LocalDate[] range = resolveRange(from, to, view);
        List<HealthLogResponse> logs = healthLogService.getHealthLogs(userId, range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Health logs fetched", logs));
    }

    @GetMapping("/logs/today")
    public ResponseEntity<ApiResponse<HealthLogResponse>> getTodayLog(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        return healthLogService.getTodayLog(userId)
                .map(log -> ResponseEntity.ok(ApiResponse.success("Today's health log", log)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No log for today", null)));
    }

    @GetMapping("/logs/{date}")
    public ResponseEntity<ApiResponse<HealthLogResponse>> getLogForDate(Authentication auth,
                                                                        @PathVariable String date) {
        Long userId = getCurrentUserId(auth);
        LocalDate d = LocalDate.parse(date);
        return healthLogService.getLogForDate(userId, d)
                .map(log -> ResponseEntity.ok(ApiResponse.success("Health log", log)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No log for date", null)));
    }

    @GetMapping("/summary/weekly")
    public ResponseEntity<ApiResponse<WeeklyHealthSummaryResponse>> getWeeklySummary(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        WeeklyHealthSummaryResponse summary = healthLogService.getWeeklySummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Weekly summary", summary));
    }

    // ── Custom Metrics ───────────────────────────────────────────────────────────

    @PostMapping("/metrics")
    public ResponseEntity<ApiResponse<CustomMetricResponse>> createMetric(Authentication auth,
                                                                          @Valid @RequestBody CustomMetricRequest request) {
        Long userId = getCurrentUserId(auth);
        CustomMetricResponse resp = customMetricService.createMetric(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Metric created", resp));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<List<CustomMetricResponse>>> getMetrics(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<CustomMetricResponse> list = customMetricService.getMetrics(userId);
        return ResponseEntity.ok(ApiResponse.success("Metrics fetched", list));
    }

    @DeleteMapping("/metrics/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMetric(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        customMetricService.deleteMetric(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Metric deleted", null));
    }

    @PostMapping("/metrics/{id}/log")
    public ResponseEntity<ApiResponse<Void>> logMetricValue(Authentication auth,
                                                            @PathVariable Long id,
                                                            @Valid @RequestBody CustomMetricLogRequest request) {
        Long userId = getCurrentUserId(auth);
        customMetricService.logValue(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Metric value logged", null));
    }

    @GetMapping("/metrics/{id}/logs")
    public ResponseEntity<ApiResponse<Object>> getMetricLogs(Authentication auth,
                                                             @PathVariable Long id,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                                             @RequestParam(required = false) String view) {
        Long userId = getCurrentUserId(auth);
        LocalDate[] range = resolveRange(from, to, view);
        return ResponseEntity.ok(ApiResponse.success("Metric logs fetched",
                customMetricService.getLogs(userId, id, range[0], range[1])));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────
    private LocalDate[] resolveRange(LocalDate from, LocalDate to, String view) throws DateTimeParseException {
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
        // default last 30 days
        return new LocalDate[] { LocalDate.now().minusDays(30), LocalDate.now() };
    }
}

