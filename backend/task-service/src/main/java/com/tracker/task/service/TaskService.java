package com.tracker.task.service;

import com.tracker.task.exception.AccessDeniedException;
import com.tracker.task.exception.TaskNotFoundException;
import com.tracker.task.kafka.producer.TaskEventProducer;
import com.tracker.task.model.dto.request.CreateTaskRequest;
import com.tracker.task.model.dto.request.UpdateTaskRequest;
import com.tracker.task.model.dto.response.TaskResponse;
import com.tracker.task.model.dto.response.TaskStatsResponse;
import com.tracker.task.model.entity.Task;
import com.tracker.task.model.enums.Priority;
import com.tracker.task.model.enums.RecurrenceType;
import com.tracker.task.model.enums.TaskStatus;
import com.tracker.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final RecurringTaskService recurringTaskService;
    private final TaskEventProducer taskEventProducer;

    // ══════════════════════════════════════════════════════════
    //  USER OPERATIONS (own tasks only)
    // ══════════════════════════════════════════════════════════

    /**
     * Create a new task for the authenticated user.
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    public TaskResponse createTask(Long userId, CreateTaskRequest request) {
        Task task = Task.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .recurrenceType(request.getRecurrenceType() != null ? request.getRecurrenceType() : RecurrenceType.NONE)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created [id={}] for user {}", saved.getId(), userId);

        // Notify notification-service via Kafka
        taskEventProducer.publishTaskCreated(userId, saved.getId(), saved.getTitle());

        return TaskResponse.fromEntity(saved);
    }

    /**
     * Get a single task by ID — only if the user owns it.
     */
    public TaskResponse getTaskById(Long userId, Long taskId) {
        Task task = findUserTask(userId, taskId);
        return TaskResponse.fromEntity(task);
    }

    /**
     * Get user's tasks with optional filters (date, from/to, status, priority, view).
     */
    public List<TaskResponse> getUserTasks(Long userId, LocalDate date, LocalDate from, LocalDate to,
                                           TaskStatus status, Priority priority, String view) {

        // If "view" shortcut is provided, calculate date range
        if (view != null) {
            LocalDate today = LocalDate.now();
            switch (view.toLowerCase()) {
                case "today" -> {
                    from = today;
                    to = today;
                }
                case "week" -> {
                    from = today.with(DayOfWeek.MONDAY);
                    to = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                }
                case "month" -> {
                    from = today.with(TemporalAdjusters.firstDayOfMonth());
                    to = today.with(TemporalAdjusters.lastDayOfMonth());
                }
            }
        }

        // If specific date is provided, treat it as from = to = date
        if (date != null) {
            from = date;
            to = date;
        }

        List<Task> tasks;

        if (from != null && to != null && status != null && priority != null) {
            tasks = taskRepository.findByUserIdAndDueDateBetweenAndStatusAndPriorityOrderByDueDateAsc(
                    userId, from, to, status, priority);
        } else if (from != null && to != null && status != null) {
            tasks = taskRepository.findByUserIdAndDueDateBetweenAndStatusOrderByDueDateAsc(
                    userId, from, to, status);
        } else if (from != null && to != null && priority != null) {
            tasks = taskRepository.findByUserIdAndDueDateBetweenAndPriorityOrderByDueDateAsc(
                    userId, from, to, priority);
        } else if (from != null && to != null) {
            tasks = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(userId, from, to);
        } else if (status != null && priority != null) {
            tasks = taskRepository.findByUserIdAndStatusAndPriorityOrderByDueDateAsc(userId, status, priority);
        } else if (status != null) {
            tasks = taskRepository.findByUserIdAndStatusOrderByDueDateAsc(userId, status);
        } else if (priority != null) {
            tasks = taskRepository.findByUserIdAndPriorityOrderByDueDateAsc(userId, priority);
        } else {
            tasks = taskRepository.findByUserIdOrderByDueDateAsc(userId);
        }

        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    /**
     * Update an existing task — only if the user owns it.
     * Only non-null fields in the request are updated.
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    public TaskResponse updateTask(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = findUserTask(userId, taskId);

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getRecurrenceType() != null) {
            task.setRecurrenceType(request.getRecurrenceType());
        }

        Task updated = taskRepository.save(task);
        log.info("Task updated [id={}] for user {}", taskId, userId);

        return TaskResponse.fromEntity(updated);
    }

    /**
     * Mark a task as completed.
     * If the task is recurring, atomically creates the next occurrence.
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    @Transactional
    public TaskResponse completeTask(Long userId, Long taskId) {
        Task task = findUserTask(userId, taskId);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new IllegalStateException("Task is already completed");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task completed [id={}] for user {}", taskId, userId);

        // Notify notification-service via Kafka
        taskEventProducer.publishTaskCompleted(userId, taskId, task.getTitle());

        // If recurring, create next occurrence atomically
        recurringTaskService.createNextOccurrence(task);

        return TaskResponse.fromEntity(task);
    }

    /**
     * Reopen a completed task (set back to PENDING).
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    public TaskResponse reopenTask(Long userId, Long taskId) {
        Task task = findUserTask(userId, taskId);

        if (task.getStatus() == TaskStatus.PENDING) {
            throw new IllegalStateException("Task is already pending");
        }

        task.setStatus(TaskStatus.PENDING);
        task.setCompletedAt(null);
        Task updated = taskRepository.save(task);

        log.info("Task reopened [id={}] for user {}", taskId, userId);

        return TaskResponse.fromEntity(updated);
    }

    /**
     * Delete a task (hard delete) — only if the user owns it.
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    public void deleteTask(Long userId, Long taskId) {
        Task task = findUserTask(userId, taskId);
        taskRepository.delete(task);
        log.info("Task deleted [id={}] for user {}", taskId, userId);
    }

    // ══════════════════════════════════════════════════════════
    //  ADMIN OPERATIONS
    // ══════════════════════════════════════════════════════════

    /**
     * Admin: View any user's tasks.
     */
    public List<TaskResponse> getTasksByUserId(Long userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    /**
     * Admin: Get platform-level task statistics.
     * Cached for 60 s — evicted automatically whenever any task is mutated.
     */
    @Cacheable(value = "platformStats", key = "'global'")
    public TaskStatsResponse getPlatformStats() {
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByStatus(TaskStatus.PENDING);
        long activeUsers = taskRepository.countDistinctUsers();

        double completionRate = totalTasks > 0
                ? Math.round((double) completedTasks / totalTasks * 10000.0) / 100.0
                : 0.0;

        return TaskStatsResponse.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .completionRate(completionRate)
                .activeUsers(activeUsers)
                .build();
    }

    /**
     * Super Admin: Delete any user's task by taskId.
     */
    @CacheEvict(value = "platformStats", allEntries = true)
    public void adminDeleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
        taskRepository.delete(task);
        log.info("Admin deleted task [id={}] of user {}", taskId, task.getUserId());
    }

    // ══════════════════════════════════════════════════════════
    //  HELPER
    // ══════════════════════════════════════════════════════════

    /**
     * Find a task ensuring the user owns it. Throws appropriate exception if not found or not owned.
     */
    private Task findUserTask(Long userId, Long taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }
}
