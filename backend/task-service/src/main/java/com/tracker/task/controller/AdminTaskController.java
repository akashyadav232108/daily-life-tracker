package com.tracker.task.controller;

import com.tracker.task.model.dto.response.ApiResponse;
import com.tracker.task.model.dto.response.TaskResponse;
import com.tracker.task.model.dto.response.TaskStatsResponse;
import com.tracker.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/admin")
@RequiredArgsConstructor
public class AdminTaskController {

    private final TaskService taskService;

    // ── GET /api/tasks/admin/users/{userId} — View any user's tasks (SUPER_ADMIN only — personal data) ──
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getUserTasks(@PathVariable Long userId) {
        List<TaskResponse> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    // ── GET /api/tasks/admin/stats — Platform task stats (ADMIN+) ──
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TaskStatsResponse>> getPlatformStats() {
        TaskStatsResponse stats = taskService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success("Platform stats retrieved successfully", stats));
    }

    // ── DELETE /api/tasks/admin/{taskId} — Delete any user's task (SUPER_ADMIN only) ──
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        taskService.adminDeleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
