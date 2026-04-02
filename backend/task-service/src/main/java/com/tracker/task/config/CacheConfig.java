package com.tracker.task.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Caffeine cache configuration for task-service.
 *
 * Cache names and TTLs:
 *   platformStats  — admin platform-wide counts; 60 s TTL, max 10 entries (global, not per-user)
 *
 * Strategy: Cache-Aside (read) + Write-Eviction (write).
 *   @Cacheable  → on read  : populate cache on DB miss
 *   @CacheEvict → on write : invalidate immediately so next read fetches fresh data
 *
 * NOT cached: task lists (too many filter combos → complex keys + high eviction frequency)
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                // Admin platform stats — global (no per-user key), short TTL, tiny max size
                buildCache("platformStats", 60, 10)
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, long ttlSeconds, long maxSize) {
        return new CaffeineCache(name,
                Caffeine.newBuilder()
                        .maximumSize(maxSize)
                        .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS)
                        .recordStats()          // enables hit/miss stats in logs
                        .build());
    }
}
