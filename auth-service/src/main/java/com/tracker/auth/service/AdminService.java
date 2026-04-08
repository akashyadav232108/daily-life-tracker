package com.tracker.auth.service;

import com.tracker.auth.exception.AccessDeniedException;
import com.tracker.auth.exception.ResourceNotFoundException;
import com.tracker.auth.model.dto.request.ChangeRoleRequest;
import com.tracker.auth.model.dto.response.PlatformStatsResponse;
import com.tracker.auth.model.dto.response.UserResponse;
import com.tracker.auth.model.entity.User;
import com.tracker.auth.model.enums.Role;
import com.tracker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;

    // ── GET /api/users/admin/all — Get all users (paginated, searchable) ──
    public Page<UserResponse> getAllUsers(String keyword, Pageable pageable) {
        Page<User> usersPage;

        if (keyword != null && !keyword.isBlank()) {
            usersPage = userRepository.searchUsers(keyword.trim(), pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(this::mapToUserResponse);
    }

    // ── GET /api/users/admin/{userId} — Get any user's profile ──
    public UserResponse getUserById(Long userId) {
        User user = findUserById(userId);
        return mapToUserResponse(user);
    }

    // ── PATCH /api/users/admin/{userId}/deactivate — Deactivate a user ──
    @Transactional
    public UserResponse deactivateUser(Long targetUserId, Long adminUserId, String adminRole) {
        User targetUser = findUserById(targetUserId);

        // ADMIN cannot deactivate other ADMINs or SUPER_ADMINs
        validateAdminCanModify(targetUser, adminRole);

        // Cannot deactivate yourself
        if (targetUserId.equals(adminUserId)) {
            throw new AccessDeniedException("You cannot deactivate your own account");
        }

        if (!targetUser.getIsActive()) {
            throw new AccessDeniedException("User is already deactivated");
        }

        targetUser.setIsActive(false);
        User updatedUser = userRepository.save(targetUser);
        log.info("User {} deactivated by admin {}", targetUserId, adminUserId);
        return mapToUserResponse(updatedUser);
    }

    // ── PATCH /api/users/admin/{userId}/activate — Reactivate a user ──
    @Transactional
    public UserResponse activateUser(Long targetUserId, Long adminUserId, String adminRole) {
        User targetUser = findUserById(targetUserId);

        // ADMIN cannot activate other ADMINs or SUPER_ADMINs
        validateAdminCanModify(targetUser, adminRole);

        if (targetUser.getIsActive()) {
            throw new AccessDeniedException("User is already active");
        }

        targetUser.setIsActive(true);
        User updatedUser = userRepository.save(targetUser);
        log.info("User {} activated by admin {}", targetUserId, adminUserId);
        return mapToUserResponse(updatedUser);
    }

    // ── PATCH /api/users/admin/{userId}/role — Change user role (ADMIN can promote to ADMIN; SUPER_ADMIN has full control) ──
    @Transactional
    public UserResponse changeRole(Long targetUserId, Long adminUserId, String adminRole, ChangeRoleRequest request) {
        User targetUser = findUserById(targetUserId);

        // Parse and validate the new role
        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Invalid role: " + request.getRole() + ". Valid roles: USER, ADMIN, SUPER_ADMIN");
        }

        // Cannot change your own role
        if (targetUserId.equals(adminUserId)) {
            throw new AccessDeniedException("You cannot change your own role");
        }

        // ADMIN can only assign USER or ADMIN roles — cannot touch SUPER_ADMIN
        if (Role.valueOf(adminRole) == Role.ADMIN) {
            if (newRole == Role.SUPER_ADMIN) {
                throw new AccessDeniedException("ADMIN cannot promote users to SUPER_ADMIN");
            }
            // ADMIN also cannot modify other ADMIN or SUPER_ADMIN accounts
            if (targetUser.getRole() == Role.ADMIN || targetUser.getRole() == Role.SUPER_ADMIN) {
                throw new AccessDeniedException("ADMIN cannot change the role of another ADMIN or SUPER_ADMIN");
            }
        }

        // No-op check
        if (targetUser.getRole() == newRole) {
            throw new AccessDeniedException("User already has the role: " + newRole.name());
        }

        Role oldRole = targetUser.getRole();
        targetUser.setRole(newRole);
        User updatedUser = userRepository.save(targetUser);

        log.info("User {} role changed from {} to {} by {} {}", targetUserId, oldRole, newRole, adminRole, adminUserId);
        return mapToUserResponse(updatedUser);
    }

    // ── DELETE /api/users/admin/{userId} — Delete a user permanently (SUPER_ADMIN only) ──
    @Transactional
    public void deleteUser(Long targetUserId, Long adminUserId) {
        User targetUser = findUserById(targetUserId);

        // Cannot delete yourself
        if (targetUserId.equals(adminUserId)) {
            throw new AccessDeniedException("You cannot delete your own account");
        }

        // Cannot delete another SUPER_ADMIN
        if (targetUser.getRole() == Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Cannot delete a SUPER_ADMIN account");
        }

        userRepository.delete(targetUser);
        log.info("User {} (email: {}) deleted permanently by SUPER_ADMIN {}", targetUserId, targetUser.getEmail(), adminUserId);
    }

    // ── GET /api/users/admin/stats — Platform statistics ──
    public PlatformStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long inactiveUsers = userRepository.countByIsActive(false);

        // Role distribution
        Map<String, Long> roleDistribution = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            roleDistribution.put(role.name(), userRepository.countByRole(role));
        }

        return PlatformStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .roleDistribution(roleDistribution)
                .build();
    }

    // ── Helper: Validate that an ADMIN can modify the target user ──
    // ADMIN cannot modify other ADMIN or SUPER_ADMIN accounts
    private void validateAdminCanModify(User targetUser, String adminRole) {
        if (Role.valueOf(adminRole) == Role.ADMIN) {
            if (targetUser.getRole() == Role.ADMIN || targetUser.getRole() == Role.SUPER_ADMIN) {
                throw new AccessDeniedException("ADMIN cannot modify other ADMIN or SUPER_ADMIN accounts");
            }
        }
    }

    // ── Helper: Find user or throw 404 ──
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    // ── Map entity to response ──
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .telegramChatId(user.getTelegramChatId())
                .build();
    }
}
