package com.tracker.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * TokenService — manages Redis operations for:
 * 1. Refresh tokens:  key = "refresh:{userId}" → value = refreshToken (TTL = 7 days)
 * 2. Token blacklist: key = "blacklist:{token}" → value = "true" (TTL = remaining expiry)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";

    // ── Refresh Token Operations ──

    /**
     * Store refresh token in Redis with TTL.
     * Overwrites any existing refresh token for this user (single active session).
     */
    public void storeRefreshToken(Long userId, String refreshToken, long ttlMillis) {
        String key = REFRESH_PREFIX + userId;
        redisTemplate.opsForValue().set(key, refreshToken, ttlMillis, TimeUnit.MILLISECONDS);
        log.debug("Stored refresh token for userId: {}", userId);
    }

    /**
     * Get stored refresh token for a user.
     * Returns null if no token exists or if expired.
     */
    public String getRefreshToken(Long userId) {
        return redisTemplate.opsForValue().get(REFRESH_PREFIX + userId);
    }

    /**
     * Delete refresh token (on logout or token rotation).
     */
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete(REFRESH_PREFIX + userId);
        log.debug("Deleted refresh token for userId: {}", userId);
    }

    // ── Token Blacklist Operations ──

    /**
     * Blacklist an access token (on logout).
     * TTL = remaining expiry time so it auto-cleans after token would have expired anyway.
     */
    public void blacklistToken(String token, long remainingExpiryMillis) {
        if (remainingExpiryMillis > 0) {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "true", remainingExpiryMillis, TimeUnit.MILLISECONDS);
            log.debug("Blacklisted token (TTL: {} ms)", remainingExpiryMillis);
        }
    }

    /**
     * Check if a token is blacklisted (called by JwtAuthenticationFilter on every request).
     */
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
