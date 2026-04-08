package com.tracker.task.config;

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
 * Distributed rate-limiting filter for task-service.
 *
 * Specific limits (all configured in application.yml):
 *   - everything → global (200 / 1 min)
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

        String identity  = resolveIdentity(request);
        String bucketKey = "rl:global:" + identity;

        BucketConfiguration config = buildConfig(props.getGlobal());
        var bucket = rateLimitProxyManager.builder().build(bucketKey, () -> config);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded — key={}, endpoint={} {}", bucketKey, method, path);
            sendRateLimitResponse(response);
        }
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
