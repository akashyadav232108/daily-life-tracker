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
 * PasswordResetService — orchestrates the 3-step forgot-password flow.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Step 1 → forgotPassword(email)                                     │
 * │    • Validate email exists in DB                                    │
 * │    • Generate OTP → store in Redis (TTL 10 min)                     │
 * │    • Send OTP email asynchronously                                  │
 * │                                                                     │
 * │  Step 2 → verifyOtp(email, otp)   returns: resetToken (UUID)        │
 * │    • Verify OTP from Redis                                          │
 * │    • Delete OTP (single-use)                                        │
 * │    • Generate resetToken → store in Redis (TTL 5 min)               │
 * │    • Return resetToken to frontend                                  │
 * │                                                                     │
 * │  Step 3 → resetPassword(resetToken, newPassword)                    │
 * │    • Verify & consume resetToken from Redis                         │
 * │    • Hash and save new password                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Security properties:
 * - OTP is single-use (deleted on verification)
 * - Reset token is single-use (deleted on password reset)
 * - Reset token proves OTP was verified without re-exposing the OTP
 * - If user exits after Step 2, reset token expires in 5 min → must restart
 * - Email is never revealed for unregistered addresses (enumeration prevention)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final OtpEmailService otpEmailService;

    // ══════════════════════════════════════════════════════════════
    //  STEP 1 — Send OTP
    // ══════════════════════════════════════════════════════════════

    /**
     * Initiate the forgot-password flow by sending an OTP to the registered email.
     * Always returns without error even if the email is not registered (prevents enumeration).
     *
     * @param email the email submitted on the forgot-password form
     */
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        if (!userRepository.existsByEmail(normalizedEmail)) {
            // Silently ignore — do NOT reveal whether the email is registered
            log.warn("Forgot-password requested for unregistered email={} — ignoring silently", normalizedEmail);
            return;
        }

        // Generate OTP and store in Redis (overwrites any previous OTP — handles resend)
        String otp = otpService.generateAndStore(normalizedEmail);

        // Send email asynchronously — never blocks the HTTP response
        otpEmailService.sendOtpEmail(normalizedEmail, otp, otpService.getOtpExpiryMinutes());

        log.info("Forgot-password OTP sent for email={}", normalizedEmail);
    }

    // ══════════════════════════════════════════════════════════════
    //  STEP 2 — Verify OTP → Issue Reset Token
    // ══════════════════════════════════════════════════════════════

    /**
     * Verify the OTP submitted by the user.
     * On success: OTP is consumed (deleted), a short-lived reset token is issued.
     * The reset token is what the frontend sends in Step 3 to set the new password.
     *
     * @param email        the user's registered email
     * @param submittedOtp the 6-digit OTP from the email
     * @return a UUID reset token (valid for 5 minutes)
     * @throws InvalidCredentialsException if OTP is wrong or expired
     */
    public String verifyOtp(String email, String submittedOtp) {
        String normalizedEmail = email.trim().toLowerCase();

        // 1. Check OTP
        if (!otpService.verify(normalizedEmail, submittedOtp)) {
            throw new InvalidCredentialsException("Invalid or expired OTP. Please request a new one.");
        }

        // 2. Consume OTP (single-use — cannot be replayed)
        otpService.invalidate(normalizedEmail);

        // 3. Issue a short-lived reset token as proof of OTP verification
        String resetToken = otpService.generateResetToken(normalizedEmail);

        log.info("OTP verified for email={} — reset token issued", normalizedEmail);
        return resetToken;
    }

    // ══════════════════════════════════════════════════════════════
    //  STEP 3 — Reset Password using Reset Token
    // ══════════════════════════════════════════════════════════════

    /**
     * Set a new password using a valid reset token obtained from Step 2.
     * The reset token is consumed immediately (single-use).
     *
     * @param resetToken  the UUID reset token returned by verifyOtp()
     * @param newPassword the new plain-text password to set
     * @throws InvalidCredentialsException if the reset token is invalid or expired
     * @throws ResourceNotFoundException   if the user no longer exists
     */
    public void resetPassword(String resetToken, String newPassword) {
        // 1. Verify and consume the reset token → returns email if valid
        String email = otpService.verifyAndConsumeResetToken(resetToken);
        if (email == null) {
            throw new InvalidCredentialsException(
                    "Your password reset session has expired. Please request a new OTP.");
        }

        // 2. Fetch user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        // 3. Hash and save new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for email={}", email);
    }
}
