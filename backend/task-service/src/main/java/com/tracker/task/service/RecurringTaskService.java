package com.tracker.task.service;

import com.tracker.task.model.entity.Task;
import com.tracker.task.model.enums.RecurrenceType;
import com.tracker.task.model.enums.TaskStatus;
import com.tracker.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Handles recurring task logic.
 *
 * When a recurring task is completed, this service creates the next occurrence:
 * - DAILY  → next day
 * - WEEKLY → same day next week
 * - MONTHLY → same date next month
 *
 * The original task stays COMPLETED; a new PENDING task is created.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTaskService {

    private final TaskRepository taskRepository;

    /**
     * If the task has a recurrence type (not NONE), create the next occurrence.
     * Returns the newly created task, or null if non-recurring.
     */
    public Task createNextOccurrence(Task completedTask) {
        if (completedTask.getRecurrenceType() == RecurrenceType.NONE) {
            return null;
        }

        LocalDate nextDueDate = calculateNextDueDate(
                completedTask.getDueDate(),
                completedTask.getRecurrenceType()
        );

        Task nextTask = Task.builder()
                .userId(completedTask.getUserId())
                .title(completedTask.getTitle())
                .description(completedTask.getDescription())
                .priority(completedTask.getPriority())
                .status(TaskStatus.PENDING)
                .dueDate(nextDueDate)
                .recurrenceType(completedTask.getRecurrenceType())
                .build();

        Task saved = taskRepository.save(nextTask);

        log.info("Created next recurring task [id={}] for user {} — due: {} ({})",
                saved.getId(), saved.getUserId(), nextDueDate, completedTask.getRecurrenceType());

        return saved;
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, RecurrenceType type) {
        return switch (type) {
            case DAILY -> currentDueDate.plusDays(1);
            case WEEKLY -> currentDueDate.plusWeeks(1);
            case MONTHLY -> currentDueDate.plusMonths(1);
            default -> currentDueDate;
        };
    }
}
