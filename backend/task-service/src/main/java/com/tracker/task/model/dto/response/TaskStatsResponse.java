package com.tracker.task.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatsResponse {

    private long totalTasks;
    private long pendingTasks;
    private long completedTasks;
    private double completionRate;   // percentage (0-100)
    private long activeUsers;        // users who have at least one task
}
