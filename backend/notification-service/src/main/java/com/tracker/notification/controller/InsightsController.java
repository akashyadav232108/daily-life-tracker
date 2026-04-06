package com.tracker.notification.controller;

import com.tracker.notification.model.dto.response.ApiResponse;
import com.tracker.notification.model.dto.response.DailySummaryResponse;
import com.tracker.notification.model.dto.response.StreakResponse;
import com.tracker.notification.model.dto.response.WeeklySummaryResponse;
import com.tracker.notification.service.InsightsService;
import com.tracker.notification.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Slf4j
public class InsightsController {

    private final InsightsService insightsService;
    private final StreakService   streakService;

    /**
     * GET /api/insights/today
     * Get today's aggregated summary for the authenticated user.
     * Data is built from Kafka events throughout the day — may have slight delay.
     */
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DailySummaryResponse>> getTodaySummary(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        DailySummaryResponse summary = insightsService.getTodaySummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Today's summary fetched", summary));
    }

    /**
     * GET /api/insights/streaks
     * Get all 3 streak records (HEALTH_LOG, TASK_COMPLETE, EXERCISE) for the authenticated user.
     */
    @GetMapping("/streaks")
    public ResponseEntity<ApiResponse<List<StreakResponse>>> getStreaks(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<StreakResponse> streaks = streakService.getStreaksForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Streaks fetched", streaks));
    }

    /**
     * GET /api/insights/weekly
     * Get the last 7 days aggregated summary with per-day breakdown.
     */
    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklySummaryResponse>> getWeeklySummary(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        WeeklySummaryResponse summary = insightsService.getWeeklySummary(userId);
        return ResponseEntity.ok(ApiResponse.success("Weekly summary fetched", summary));
    }
}
