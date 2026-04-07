package com.tracker.auth.kafka.producer;

import com.tracker.auth.kafka.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private static final String USER_EVENTS_TOPIC = "user-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish a USER_REGISTERED event so notification-service can send a welcome email.
     */
    public void publishUserRegistered(Long userId, String email, String fullName) {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(userId)
                .email(email)
                .fullName(fullName)
                .build();

        kafkaTemplate.send(USER_EVENTS_TOPIC, String.valueOf(userId), event);
        log.info("Published USER_REGISTERED event for userId={} email={}", userId, email);
    }
}
