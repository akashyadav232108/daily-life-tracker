package com.tracker.notification.model.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Kafka event received from auth-service when a new user registers.
 * Used to trigger a welcome email in notification-service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {

    private Long userId;
    private String email;
    private String fullName;
    private Instant registeredAt;
}
