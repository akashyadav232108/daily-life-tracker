package com.tracker.notification.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/notifications/admin/broadcast
 * Allows ADMIN/SUPER_ADMIN to send a notification to all users.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;
}
