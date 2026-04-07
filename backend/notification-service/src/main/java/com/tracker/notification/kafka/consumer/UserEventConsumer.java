package com.tracker.notification.kafka.consumer;

import com.tracker.notification.model.dto.event.UserEvent;
import com.tracker.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes USER_REGISTERED events published by auth-service.
 * Sends a personalised welcome email to the newly registered user.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final EmailService emailService;

    @KafkaListener(
            topics = "user-events",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "userKafkaListenerContainerFactory"
    )
    public void handleUserEvent(UserEvent event) {
        if (event == null) {
            log.warn("Received null UserEvent — skipping");
            return;
        }

        log.info("Received UserEvent for userId={} email={}", event.getUserId(), event.getEmail());

        try {
            emailService.sendWelcomeEmail(event.getEmail(), event.getFullName());
        } catch (Exception e) {
            // Log and swallow — never let a failed welcome email crash the consumer
            log.error("Error processing UserEvent for userId={}: {}", event.getUserId(), e.getMessage(), e);
        }
    }
}
