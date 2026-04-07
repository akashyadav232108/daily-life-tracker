package com.tracker.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * OtpService — manages the full OTP + Reset Token lifecycle in Redis.
 *
 * Redis key patterns:
 *   otp:reset:{email}   →  "123456"        TTL = otp.expiry-minutes (10 min)
 *   otp:token:{uuid}    →  email address   TTL = reset.token.expiry-minutes (5 min)
 *
 * Flow:
 *   1. generateAndStore(email)          → creates OTP in Redis, returns OTP string
 *   2. verify(email, otp)               → checks OTP (does NOT delete it)
 *   3. invalidate(email)                → deletes OTP from Redis
 *   4. generateResetToken(email)        → creates reset token in Redis, returns UUID
 *   5. verifyAndConsumeResetToken(token)→ checks token, deletes it, returns email or null
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final RedisTemplate<String, String> redisTemplate;

    // ── Redis key prefixes ─────────────────────────────────────────
    private static final String OTP_PREFIX         = "otp:reset:";
    private static final String RESET_TOKEN_PREFIX = "otp:token:";

    // ── OTP config ─────────────────────────────────────────────────
    private static final int OTP_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${otp.expiry-minutes:10}")
    private long otpExpiryMinutes;

    @Value("${otp.reset-token-expiry-minutes:5}")
    private long resetTokenExpiryMinutes;

    // ══════════════════════════════════════════════════════════════
    //  OTP OPERATIONS
    // ══════════════════════════════════════════════════════════════

    /**
     * Generate a 6-digit OTP, store it in Redis with TTL, and return the OTP string.
     * Overwrites any previous OTP for the same email (handles resend).
     */
    public String generateAndStore(String email) {
        String otp = String.format("%0" + OTP_LENGTH + "d", RANDOM.nextInt((int) Math.pow(10, OTP_LENGTH)));
        String key = OTP_PREFIX + email.toLowerCase();
        redisTemplate.opsForValue().set(key, otp, otpExpiryMinutes, TimeUnit.MINUTES);
        log.debug("OTP generated and stored for email={} (TTL={}min)", email, otpExpiryMinutes);
        return otp;
    }

    /**
     * Verify a submitted OTP against the stored value in Redis.
     * Does NOT delete the OTP — call invalidate() separately after consuming.
     *
     * @return true if OTP matches and is not expired; false otherwise
     */
    public boolean verify(String email, String submittedOtp) {
        String key = OTP_PREFIX + email.toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            log.warn("OTP verify failed — no OTP found (expired or not requested) for email={}", email);
            return false;
        }

        boolean matches = storedOtp.equals(submittedOtp.trim());
        if (!matches) {
            log.warn("OTP verify failed — incorrect OTP submitted for email={}", email);
        }
        return matches;
    }

    /**
     * Delete the OTP from Redis (called after successful OTP verification).
     * Ensures the OTP is single-use and cannot be replayed.
     */
    public void invalidate(String email) {
        redisTemplate.delete(OTP_PREFIX + email.toLowerCase());
        log.debug("OTP invalidated for email={}", email);
    }

    /** Returns the OTP expiry duration in minutes (used by email template). */
    public long getOtpExpiryMinutes() {
        return otpExpiryMinutes;
    }

    // ══════════════════════════════════════════════════════════════
    //  RESET TOKEN OPERATIONS
    // ══════════════════════════════════════════════════════════════

    /**
     * Generate a UUID reset token and store it in Redis.
     * Called immediately after a successful OTP verification.
     * The token proves the user passed OTP verification without exposing the OTP.
     *
     * @param email the verified user email (stored as the token's value)
     * @return the UUID reset token to return to the frontend
     */
    public String generateResetToken(String email) {
        String token = UUID.randomUUID().toString();
        String key = RESET_TOKEN_PREFIX + token;
        redisTemplate.opsForValue().set(key, email.toLowerCase(), resetTokenExpiryMinutes, TimeUnit.MINUTES);
        log.debug("Reset token generated for email={} (TTL={}min)", email, resetTokenExpiryMinutes);
        return token;
    }

    /**
     * Verify a reset token and consume it (single-use).
     * Deletes the token from Redis immediately to prevent replay.
     *
     * @param token the UUID reset token from the frontend
     * @return the email associated with this token, or null if expired/invalid
     */
    public String verifyAndConsumeResetToken(String token) {
        if (token == null || token.isBlank()) return null;
        String key = RESET_TOKEN_PREFIX + token;
        String email = redisTemplate.opsForValue().get(key);
        if (email != null) {
            redisTemplate.delete(key);
            log.debug("Reset token consumed for email={}", email);
        } else {
            log.warn("Reset token not found or expired — token={}", token);
        }
        return email;
    }
}
