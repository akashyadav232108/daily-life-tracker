package com.tracker.auth.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Kafka event published when a new user registers successfully.
 * Consumed by notification-service to send a welcome email.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {

    /** Internal user ID assigned by auth-service. */
    private Long userId;

    /** User's email address — used as the email recipient. */
    private String email;

    /** User's full name — used in the email greeting. */
    private String fullName;

    /** UTC timestamp of registration. */
    @Builder.Default
    private Instant registeredAt = Instant.now();
}
