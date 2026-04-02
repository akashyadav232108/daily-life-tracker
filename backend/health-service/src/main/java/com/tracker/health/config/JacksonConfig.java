package com.tracker.health.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    /**
     * Explicitly registers JavaTimeModule so that Java 8 date/time types
     * (LocalDate, LocalDateTime, OffsetDateTime, etc.) are serialized correctly.
     * This bean becomes the primary ObjectMapper used by Spring MVC and anywhere
     * else an ObjectMapper is injected (e.g. JwtAuthenticationEntryPoint).
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
