package com.tracker.notification.config;

import com.tracker.notification.model.dto.event.ExpenseEvent;
import com.tracker.notification.model.dto.event.HealthEvent;
import com.tracker.notification.model.dto.event.TaskEvent;
import com.tracker.notification.model.dto.event.UserEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    // ── Shared base properties ────────────────────────────────────

    private Map<String, Object> baseConsumerProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        // Don't use type headers — producers set ADD_TYPE_INFO_HEADERS = false
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        return props;
    }

    // ── TaskEvent consumer ────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, TaskEvent> taskEventConsumerFactory() {
        JsonDeserializer<TaskEvent> deserializer = new JsonDeserializer<>(TaskEvent.class, false);
        return new DefaultKafkaConsumerFactory<>(baseConsumerProps(), new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TaskEvent> taskKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, TaskEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(taskEventConsumerFactory());
        return factory;
    }

    // ── HealthEvent consumer ──────────────────────────────────────

    @Bean
    public ConsumerFactory<String, HealthEvent> healthEventConsumerFactory() {
        JsonDeserializer<HealthEvent> deserializer = new JsonDeserializer<>(HealthEvent.class, false);
        return new DefaultKafkaConsumerFactory<>(baseConsumerProps(), new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, HealthEvent> healthKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, HealthEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(healthEventConsumerFactory());
        return factory;
    }

    // ── ExpenseEvent consumer ─────────────────────────────────────

    @Bean
    public ConsumerFactory<String, ExpenseEvent> expenseEventConsumerFactory() {
        JsonDeserializer<ExpenseEvent> deserializer = new JsonDeserializer<>(ExpenseEvent.class, false);
        return new DefaultKafkaConsumerFactory<>(baseConsumerProps(), new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ExpenseEvent> expenseKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ExpenseEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(expenseEventConsumerFactory());
        return factory;
    }

    // ── UserEvent consumer ────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, UserEvent> userEventConsumerFactory() {
        JsonDeserializer<UserEvent> deserializer = new JsonDeserializer<>(UserEvent.class, false);
        return new DefaultKafkaConsumerFactory<>(baseConsumerProps(), new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, UserEvent> userKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, UserEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(userEventConsumerFactory());
        return factory;
    }
}
