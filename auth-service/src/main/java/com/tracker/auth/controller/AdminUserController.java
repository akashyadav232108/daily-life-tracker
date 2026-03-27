package com.tracker.auth.controller;

import com.tracker.auth.model.dto.request.ChangeRoleRequest;
import com.tracker.auth.model.dto.response.ApiResponse;
import com.tracker.auth.model.dto.response.PlatformStatsResponse;
import com.tracker.auth.model.dto.response.UserResponse;
import com.tracker.auth.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

/**
 * Admin User Controller — ADMIN & SUPER_ADMIN only.
 *
 * Security:
 * - All endpoints under /api/users/admin/** require ADMIN or SUPER_ADMIN role (configured in SecurityConfig).
 * - SUPER_ADMIN-only endpoints are additionally secured with @PreAuthorize("hasRole('SUPER_ADMIN')").
 * - ADMIN cannot modify other ADMIN or SUPER_ADMIN accounts (enforced in AdminService).
 */
@RestController
@RequestMapping("/api/users/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminService adminService;

    // ── GET /api/users/admin/all — Get all users (paginated, searchable) ──
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponse> users = adminService.getAllUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    // ── GET /api/users/admin/{userId} — Get any user's profile by ID ──
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        UserResponse user = adminService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    // ── PATCH /api/users/admin/{userId}/deactivate — Deactivate a user account ──
    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(
            @PathVariable Long userId,
            Authentication authentication) {

        Long adminUserId = (Long) authentication.getPrincipal();
        String adminRole = extractRole(authentication);

        UserResponse user = adminService.deactivateUser(userId, adminUserId, adminRole);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", user));
    }

    // ── PATCH /api/users/admin/{userId}/activate — Reactivate a user account ──
    @PatchMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(
            @PathVariable Long userId,
            Authentication authentication) {

        Long adminUserId = (Long) authentication.getPrincipal();
        String adminRole = extractRole(authentication);

        UserResponse user = adminService.activateUser(userId, adminUserId, adminRole);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", user));
    }

    // ── PATCH /api/users/admin/{userId}/role — Change user role (SUPER_ADMIN only) ──
    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody ChangeRoleRequest request,
            Authentication authentication) {

        Long adminUserId = (Long) authentication.getPrincipal();

        UserResponse user = adminService.changeRole(userId, adminUserId, request);
        return ResponseEntity.ok(ApiResponse.success("User role updated to " + request.getRole().toUpperCase(), user));
    }

    // ── DELETE /api/users/admin/{userId} — Delete a user permanently (SUPER_ADMIN only) ──
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {

        Long adminUserId = (Long) authentication.getPrincipal();

        adminService.deleteUser(userId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("User deleted permanently"));
    }

    // ── GET /api/users/admin/stats — Platform statistics ──
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PlatformStatsResponse>> getPlatformStats() {
        PlatformStatsResponse stats = adminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success("Platform stats retrieved successfully", stats));
    }

    // ── Helper: Extract role from authentication (without "ROLE_" prefix) ──
    private String extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))  // Remove "ROLE_" prefix → "ADMIN" or "SUPER_ADMIN"
                .findFirst()
                .orElse("USER");
    }
}
