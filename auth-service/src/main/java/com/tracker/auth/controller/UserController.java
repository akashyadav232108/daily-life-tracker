package com.tracker.auth.controller;

import com.tracker.auth.model.dto.request.ChangePasswordRequest;
import com.tracker.auth.model.dto.request.DeleteAccountRequest;
import com.tracker.auth.model.dto.request.UpdateProfileRequest;
import com.tracker.auth.model.dto.response.ApiResponse;
import com.tracker.auth.model.dto.response.UserResponse;
import com.tracker.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── GET /api/users/me — Get current user profile ──
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponse user = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", user));
    }

    // ── PUT /api/users/me — Update profile (name, telegram chat ID) ──
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponse user = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    // ── PUT /api/users/me/password — Change password ──
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // ── DELETE /api/users/me — Permanently delete own account (password required) ──
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount(
            Authentication authentication,
            @Valid @RequestBody DeleteAccountRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        userService.deleteMyAccount(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Account permanently deleted"));
    }
}
