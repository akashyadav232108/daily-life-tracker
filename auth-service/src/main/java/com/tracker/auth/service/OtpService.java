package com.tracker.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

/**
 * OtpService — manages OTP lifecycle in Redis for forgot-password flow.
 *
 * Redis key pattern:
 *   otp:reset:{email}  →  "123456"  (TTL = otp.expiry-minutes, default 10 min)
 *
 * Rules:
 * - A new OTP overwrites any previous one (prevents accumulation).
 * - OTP is deleted immediately after successful verification (single-use).
 * - Expired OTPs are cleaned up automatically by Redis TTL.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String OTP_PREFIX = "otp:reset:";
    private static final int OTP_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${otp.expiry-minutes:10}")
    private long otpExpiryMinutes;

    /**
     * Generate a 6-digit OTP, store it in Redis with TTL, and return the OTP string.
     * Any previously stored OTP for the same email is overwritten.
     *
     * @param email the user's registered email (used as part of the Redis key)
     * @return the generated OTP string (e.g. "482913")
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
     *
     * @param email       the user's email
     * @param submittedOtp the OTP entered by the user
     * @return true if OTP matches and is not expired; false otherwise
     */
    public boolean verify(String email, String submittedOtp) {
        String key = OTP_PREFIX + email.toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            log.warn("OTP verification failed — no OTP found (expired or not requested) for email={}", email);
            return false;
        }

        boolean matches = storedOtp.equals(submittedOtp.trim());
        if (!matches) {
            log.warn("OTP verification failed — incorrect OTP for email={}", email);
        }
        return matches;
    }

    /**
     * Delete the OTP from Redis after successful password reset.
     * Ensures the OTP cannot be reused.
     *
     * @param email the user's email
     */
    public void invalidate(String email) {
        redisTemplate.delete(OTP_PREFIX + email.toLowerCase());
        log.debug("OTP invalidated for email={}", email);
    }

    /**
     * Returns the OTP expiry duration in minutes (used by email template).
     */
    public long getOtpExpiryMinutes() {
        return otpExpiryMinutes;
    }
}
