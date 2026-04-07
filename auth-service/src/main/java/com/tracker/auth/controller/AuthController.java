package com.tracker.auth.controller;

import com.tracker.auth.model.dto.request.ForgotPasswordRequest;
import com.tracker.auth.model.dto.request.LoginRequest;
import com.tracker.auth.model.dto.request.RefreshTokenRequest;
import com.tracker.auth.model.dto.request.RegisterRequest;
import com.tracker.auth.model.dto.request.ResetPasswordRequest;
import com.tracker.auth.model.dto.request.VerifyOtpRequest;
import com.tracker.auth.model.dto.response.ApiResponse;
import com.tracker.auth.model.dto.response.AuthResponse;
import com.tracker.auth.service.AuthService;
import com.tracker.auth.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    // ── POST /api/auth/register ──
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    // ── POST /api/auth/login ──
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ── POST /api/auth/refresh ──
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    // ── POST /api/auth/logout ──
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication,
                                                     HttpServletRequest request) {
        Long userId = (Long) authentication.getPrincipal();

        String bearerToken = request.getHeader("Authorization");
        String accessToken = null;
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            accessToken = bearerToken.substring(7);
        }

        authService.logout(userId, accessToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    // ══════════════════════════════════════════════════════════════
    //  FORGOT PASSWORD — 3-STEP FLOW
    // ══════════════════════════════════════════════════════════════

    /**
     * Step 1: User submits their email → OTP is sent.
     * Always returns 200 to prevent user enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If that email is registered, an OTP has been sent. Please check your inbox."));
    }

    /**
     * Step 2: User submits the OTP → verified → returns a short-lived reset token.
     * The reset token is proof that OTP was verified; used in Step 3 to set new password.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String resetToken = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully.", resetToken));
    }

    /**
     * Step 3: User submits reset token + new password → password is updated.
     * The reset token is consumed immediately (single-use).
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getResetToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now log in."));
    }
}
