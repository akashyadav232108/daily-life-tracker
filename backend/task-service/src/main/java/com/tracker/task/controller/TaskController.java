package com.tracker.task.controller;

import com.tracker.task.model.dto.request.CreateTaskRequest;
import com.tracker.task.model.dto.request.UpdateTaskRequest;
import com.tracker.task.model.dto.response.ApiResponse;
import com.tracker.task.model.dto.response.TaskResponse;
import com.tracker.task.model.enums.Priority;
import com.tracker.task.model.enums.TaskStatus;
import com.tracker.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ── POST /api/tasks — Create a new task ──
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            Authentication authentication,
            @Valid @RequestBody CreateTaskRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        TaskResponse response = taskService.createTask(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    // ── GET /api/tasks — Get own tasks (with query filters) ──
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getUserTasks(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String view) {

        Long userId = (Long) authentication.getPrincipal();
        List<TaskResponse> tasks = taskService.getUserTasks(userId, date, from, to, status, priority, view);

        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    // ── GET /api/tasks/{id} — Get a single own task by ID ──
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        TaskResponse response = taskService.getTaskById(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", response));
    }

    // ── PUT /api/tasks/{id} — Update own task ──
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        TaskResponse response = taskService.updateTask(userId, id, request);

        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    // ── PATCH /api/tasks/{id}/complete — Mark own task as completed ──
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        TaskResponse response = taskService.completeTask(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Task marked as completed", response));
    }

    // ── PATCH /api/tasks/{id}/reopen — Reopen own completed task ──
    @PatchMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<TaskResponse>> reopenTask(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        TaskResponse response = taskService.reopenTask(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Task reopened successfully", response));
    }

    // ── DELETE /api/tasks/{id} — Delete own task ──
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        taskService.deleteTask(userId, id);

        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
