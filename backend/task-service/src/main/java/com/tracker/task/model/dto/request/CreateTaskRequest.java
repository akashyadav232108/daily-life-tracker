package com.tracker.task.model.dto.request;

import com.tracker.task.model.enums.Priority;
import com.tracker.task.model.enums.RecurrenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private Priority priority;      // defaults to MEDIUM if null

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private RecurrenceType recurrenceType;  // defaults to NONE if null
}
