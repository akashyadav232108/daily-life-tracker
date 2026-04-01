package com.tracker.task.model.dto.response;

import com.tracker.task.model.entity.Task;
import com.tracker.task.model.enums.Priority;
import com.tracker.task.model.enums.RecurrenceType;
import com.tracker.task.model.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private RecurrenceType recurrenceType;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // ── Map Entity to Response ──
    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .recurrenceType(task.getRecurrenceType())
                .createdAt(task.getCreatedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }
}
