package com.tracker.auth.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Distributed rate-limiting filter for auth-service.
 *
 * Bucket key  : "rl:{category}:{userId}" (authenticated)
 *               "rl:{category}:{clientIP}" (unauthenticated)
 * Algorithm   : Token Bucket (Bucket4j) backed by Redis.
 * Response    : HTTP 429 + JSON on limit exceeded.
 *
 * Specific limits (all configured in application.yml):
 *   - /api/auth/login, /register          → auth-sensitive  (5 / 1 min)
 *   - /api/auth/forgot-password, otp, reset → otp-flow     (3 / 10 min)
 *   - PUT /api/users/me/password           → password-ops   (5 / 10 min)
 *   - DELETE /api/users/me                 → account-delete (3 / 1 hr)
 *   - everything else                      → global         (200 / 1 min)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final LettuceBasedProxyManager<String> rateLimitProxyManager;
    private final RateLimitProperties props;

    // ── Filter entry point ────────────────────────────────────────────────────

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path   = request.getRequestURI();
        String method = request.getMethod();

        String category  = resolveCategory(method, path);
        String identity  = resolveIdentity(request);
        String bucketKey = "rl:" + category + ":" + identity;

        BucketConfiguration config = resolveConfig(method, path);
        var bucket = rateLimitProxyManager.builder().build(bucketKey, () -> config);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded — key={}, endpoint={} {}", bucketKey, method, path);
            sendRateLimitResponse(response);
        }
    }

    // ── Rate-limit config per endpoint ────────────────────────────────────────

    private BucketConfiguration resolveConfig(String method, String path) {
        if (isAuthSensitive(path))         return buildConfig(props.getAuthSensitive());
        if (isOtpFlow(path))               return buildConfig(props.getOtpFlow());
        if (isPasswordOps(method, path))   return buildConfig(props.getPasswordOps());
        if (isAccountDelete(method, path)) return buildConfig(props.getAccountDelete());
        return buildConfig(props.getGlobal());
    }

    private String resolveCategory(String method, String path) {
        if (isAuthSensitive(path))         return "auth";
        if (isOtpFlow(path))               return "otp";
        if (isPasswordOps(method, path))   return "pwd";
        if (isAccountDelete(method, path)) return "del";
        return "global";
    }

    // ── Path matchers ─────────────────────────────────────────────────────────

    private boolean isAuthSensitive(String path) {
        return path.equals("/api/auth/login") || path.equals("/api/auth/register");
    }

    private boolean isOtpFlow(String path) {
        return path.equals("/api/auth/forgot-password")
                || path.equals("/api/auth/verify-otp")
                || path.equals("/api/auth/reset-password");
    }

    private boolean isPasswordOps(String method, String path) {
        return "PUT".equals(method) && path.equals("/api/users/me/password");
    }

    private boolean isAccountDelete(String method, String path) {
        return "DELETE".equals(method) && path.equals("/api/users/me");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BucketConfiguration buildConfig(RateLimitProperties.LimitConfig cfg) {
        return BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(cfg.getTokens())
                        .refillGreedy(cfg.getTokens(), cfg.getPeriod())
                        .build())
                .build();
    }

    /**
     * Authenticated requests  → keyed by userId  (precise, per-user limiting).
     * Unauthenticated requests → keyed by client IP (covers login/register/OTP abuse).
     * This filter runs AFTER JwtAuthenticationFilter, so SecurityContext is populated.
     */
    private String resolveIdentity(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Long userId) {
            return "user:" + userId;
        }
        return "ip:" + getClientIp(request);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        response.getWriter().write("""
                {
                    "success": false,
                    "message": "Too many requests. Please try again later.",
                    "error": "RATE_LIMIT_EXCEEDED"
                }
                """);
    }
}
