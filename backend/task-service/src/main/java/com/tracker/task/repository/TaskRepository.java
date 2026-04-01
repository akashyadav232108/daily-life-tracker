package com.tracker.task.repository;

import com.tracker.task.model.entity.Task;
import com.tracker.task.model.enums.Priority;
import com.tracker.task.model.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ── Find a task by ID and userId (ensures user owns the task) ──
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    // ── Get all tasks for a user ──
    List<Task> findByUserIdOrderByDueDateAsc(Long userId);

    // ── Filter by specific date ──
    List<Task> findByUserIdAndDueDateOrderByDueDateAsc(Long userId, LocalDate dueDate);

    // ── Filter by date range ──
    List<Task> findByUserIdAndDueDateBetweenOrderByDueDateAsc(Long userId, LocalDate from, LocalDate to);

    // ── Filter by status ──
    List<Task> findByUserIdAndStatusOrderByDueDateAsc(Long userId, TaskStatus status);

    // ── Filter by priority ──
    List<Task> findByUserIdAndPriorityOrderByDueDateAsc(Long userId, Priority priority);

    // ── Filter by date range + status ──
    List<Task> findByUserIdAndDueDateBetweenAndStatusOrderByDueDateAsc(
            Long userId, LocalDate from, LocalDate to, TaskStatus status);

    // ── Filter by date range + priority ──
    List<Task> findByUserIdAndDueDateBetweenAndPriorityOrderByDueDateAsc(
            Long userId, LocalDate from, LocalDate to, Priority priority);

    // ── Filter by date range + status + priority ──
    List<Task> findByUserIdAndDueDateBetweenAndStatusAndPriorityOrderByDueDateAsc(
            Long userId, LocalDate from, LocalDate to, TaskStatus status, Priority priority);

    // ── Filter by status + priority (no date range) ──
    List<Task> findByUserIdAndStatusAndPriorityOrderByDueDateAsc(
            Long userId, TaskStatus status, Priority priority);

    // ── Admin: Get all tasks for any user ──
    List<Task> findByUserId(Long userId);

    // ── Admin: Total task count ──
    long count();

    // ── Admin: Count by status ──
    long countByStatus(TaskStatus status);

    // ── Admin: Count distinct active users (users who have at least one task) ──
    @Query("SELECT COUNT(DISTINCT t.userId) FROM Task t")
    long countDistinctUsers();
}
