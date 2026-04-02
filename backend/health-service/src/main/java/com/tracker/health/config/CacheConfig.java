package com.tracker.health.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Caffeine cache configuration for health-service.
 *
 * Cache names, keys and TTLs:
 *   weeklySummary  — key=userId  — weekly health aggregates; 5 min TTL, max 500 users
 *   exercisePlans  — key=userId  — all plans list per user;   5 min TTL, max 500 users
 *   activePlan     — key=userId  — current active plan;       5 min TTL, max 500 users
 *   todayPlanned   — key=userId  — today's planned workout;   5 min TTL, max 500 users
 *   customMetrics  — key=userId  — user-defined metrics;     10 min TTL, max 500 users
 *
 * Strategy: Cache-Aside (read) + Write-Eviction (write).
 *   @Cacheable  → on read  : serve from cache; populate on DB miss
 *   @CacheEvict → on write : immediately invalidate the user's cache entry
 *
 * NOT cached:
 *   - getHealthLogs(from, to)     → parameterised date range, too many cache key variants
 *   - getTodayLog / getLogForDate → changes on every upsert; safer to skip
 *   - getExerciseLogs             → frequently added during a session
 *   - single-item lookups         → DB index lookup < 1 ms, not worth caching
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache("weeklySummary", 300,  500),   // 5 min
                buildCache("exercisePlans", 300,  500),   // 5 min
                buildCache("activePlan",    300,  500),   // 5 min
                buildCache("todayPlanned",  300,  500),   // 5 min
                buildCache("customMetrics", 600,  500)    // 10 min
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, long ttlSeconds, long maxSize) {
        return new CaffeineCache(name,
                Caffeine.newBuilder()
                        .maximumSize(maxSize)
                        .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS)
                        .recordStats()          // exposes hit/miss ratio for debugging
                        .build());
    }
}
