package com.tracker.auth.service;

import com.tracker.auth.exception.InvalidCredentialsException;
import com.tracker.auth.exception.UserAlreadyExistsException;
import com.tracker.auth.kafka.producer.UserEventProducer;
import com.tracker.auth.model.dto.request.LoginRequest;
import com.tracker.auth.model.dto.request.RefreshTokenRequest;
import com.tracker.auth.model.dto.request.RegisterRequest;
import com.tracker.auth.model.dto.response.AuthResponse;
import com.tracker.auth.model.dto.response.UserResponse;
import com.tracker.auth.model.entity.User;
import com.tracker.auth.model.enums.Role;
import com.tracker.auth.repository.UserRepository;
import com.tracker.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final UserEventProducer userEventProducer;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    // ── Register ──
    public AuthResponse register(RegisterRequest request) {

       try {
           User user = User.builder()
                   .email(request.getEmail().trim().toLowerCase())
                   .passwordHash(passwordEncoder.encode(request.getPassword()))
                   .fullName(request.getFullName().trim())
                   .role(Role.USER)
                   .isActive(true)
                   .build();

           User savedUser = userRepository.save(user);

           // Publish event so notification-service can send a welcome email
           try {
               userEventProducer.publishUserRegistered(
                       savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());
           } catch (Exception e) {
               log.warn("Failed to publish USER_REGISTERED event for userId={}: {}", savedUser.getId(), e.getMessage());
           }

           return generateAndStoreTokens(savedUser);

       } catch (DataIntegrityViolationException e) {
           throw new UserAlreadyExistsException(
                   "User with email " + request.getEmail() + " already exists"
           );
       }

    }

    // ── Login ──
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new InvalidCredentialsException("Your account has been deactivated. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return generateAndStoreTokens(user);
    }

    // ── Refresh Token ──
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // 1. Validate the refresh token (signature + expiry)
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        // 2. Extract userId
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        // 3. Check if the stored refresh token matches (prevents reuse of old tokens)
        String storedToken = tokenService.getRefreshToken(userId);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new InvalidCredentialsException("Refresh token not recognized. Please login again.");
        }

        // 4. Fetch user for latest role/email (role changes reflect on next refresh)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // 5. Check if user is still active
        if (!user.getIsActive()) {
            tokenService.deleteRefreshToken(userId);
            throw new InvalidCredentialsException("Your account has been deactivated. Contact admin.");
        }

        // 6. Delete old refresh token and generate new tokens (token rotation)
        tokenService.deleteRefreshToken(userId);

        log.debug("Refresh token rotated for userId: {}", userId);
        return generateAndStoreTokens(user);
    }

    // ── Logout ──
    public void logout(Long userId, String accessToken) {
        // 1. Blacklist the access token (TTL = remaining expiry)
        long remainingExpiry = jwtTokenProvider.getRemainingExpiry(accessToken);
        tokenService.blacklistToken(accessToken, remainingExpiry);

        // 2. Delete the refresh token from Redis
        tokenService.deleteRefreshToken(userId);

        log.debug("User {} logged out successfully", userId);
    }

    // ── Helper: Generate tokens + store refresh token in Redis ──
    private AuthResponse generateAndStoreTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        // Store refresh token in Redis with TTL
        tokenService.storeRefreshToken(user.getId(), refreshToken, refreshTokenExpirationMs);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    // ── Map entity to response ──
    public UserResponse mapToUserResponse(User user) {
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
