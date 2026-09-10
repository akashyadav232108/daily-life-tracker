package com.tracker.auth.service;

import com.tracker.auth.exception.InvalidCredentialsException;
import com.tracker.auth.exception.ResourceNotFoundException;
import com.tracker.auth.model.dto.request.ChangePasswordRequest;
import com.tracker.auth.model.dto.request.DeleteAccountRequest;
import com.tracker.auth.model.dto.request.UpdateProfileRequest;
import com.tracker.auth.model.dto.response.UserResponse;
import com.tracker.auth.model.entity.User;
import com.tracker.auth.model.enums.Role;
import com.tracker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Get Profile ──
    public UserResponse getProfile(Long userId) {
        User user = findUserById(userId);
        return mapToUserResponse(user);
    }

    // ── Update Profile (name, telegram chat ID) ──
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        // Only update fields that are provided (not null)
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getTelegramChatId() != null) {
            user.setTelegramChatId(request.getTelegramChatId().trim());
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    // ── Change Password ──
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Ensure new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        // Invalidate all old tokens
        user.setTokenVersion(
                user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1
        );

        userRepository.save(user);
    }

    // ── Delete Own Account ──
    @Transactional
    public void deleteMyAccount(Long userId, DeleteAccountRequest request) {
        User user = findUserById(userId);

        // SUPER_ADMIN cannot self-delete (prevents system lockout)
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new AccessDeniedException("SUPER_ADMIN accounts cannot be self-deleted. Contact your system owner.");
        }

        // Verify the provided password against stored hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect password. Account deletion cancelled.");
        }

        userRepository.delete(user);
        log.info("User {} (email: {}, role: {}) permanently deleted their own account", userId, user.getEmail(), user.getRole());
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
