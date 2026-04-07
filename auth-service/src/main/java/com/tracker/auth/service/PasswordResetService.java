package com.tracker.auth.service;

import com.tracker.auth.exception.InvalidCredentialsException;
import com.tracker.auth.exception.ResourceNotFoundException;
import com.tracker.auth.model.entity.User;
import com.tracker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * PasswordResetService — orchestrates the full forgot-password OTP flow.
 *
 * Flow:
 * 1. forgotPassword(email)
 *    → validate email exists in DB
 *    → generate OTP via OtpService (stored in Redis with TTL)
 *    → send OTP email via OtpEmailService (async, non-blocking)
 *
 * 2. resetPassword(email, otp, newPassword)
 *    → verify OTP from Redis
 *    → hash and save new password
 *    → invalidate OTP (delete from Redis — single-use)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final OtpEmailService otpEmailService;

    /**
     * Step 1: Initiate forgot-password flow.
     *
     * Generates and stores an OTP in Redis, then sends the OTP email asynchronously.
     * Always returns success even if email is not found (prevents email enumeration).
     *
     * @param email the email address submitted by the user on the forgot-password form
     */
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        // Silently return if email is not registered — prevents user enumeration attacks
        if (!userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Forgot-password requested for unregistered email={} — returning silently", normalizedEmail);
            return;
        }

        // Generate OTP and store in Redis (overwrites any previous OTP)
        String otp = otpService.generateAndStore(normalizedEmail);

        // Send OTP email asynchronously (does not block the HTTP response)
        otpEmailService.sendOtpEmail(normalizedEmail, otp, otpService.getOtpExpiryMinutes());

        log.info("Forgot-password OTP sent for email={}", normalizedEmail);
    }

    /**
     * Step 2: Verify OTP and reset the password.
     *
     * @param email       the user's email
     * @param otp         the OTP entered by the user
     * @param newPassword the new plain-text password to set
     * @throws InvalidCredentialsException if OTP is invalid or expired
     * @throws ResourceNotFoundException   if the user no longer exists
     */
    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.trim().toLowerCase();

        // 1. Verify OTP
        if (!otpService.verify(normalizedEmail, otp)) {
            throw new InvalidCredentialsException("Invalid or expired OTP. Please request a new one.");
        }

        // 2. Fetch user
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        // 3. Hash and save new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Invalidate OTP — cannot be reused
        otpService.invalidate(normalizedEmail);

        log.info("Password reset successfully for email={}", normalizedEmail);
    }
}
