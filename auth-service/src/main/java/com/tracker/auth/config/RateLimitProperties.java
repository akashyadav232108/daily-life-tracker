package com.tracker.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Binds all rate-limit.* entries from application.yml.
 * Each LimitConfig holds the token bucket capacity + refill period.
 * Defaults match the yml values so the app starts safely even if
 * a specific key is omitted from the config file.
 */
@Data
@Component
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    /** Fallback for every endpoint not matched by a specific rule. */
    private LimitConfig global = new LimitConfig(200, 1, 0);

    /** POST /api/auth/login, POST /api/auth/register */
    private LimitConfig authSensitive = new LimitConfig(5, 1, 0);

    /** POST /api/auth/forgot-password, /verify-otp, /reset-password */
    private LimitConfig otpFlow = new LimitConfig(3, 10, 0);

    /** PUT /api/users/me/password */
    private LimitConfig passwordOps = new LimitConfig(5, 10, 0);

    /** DELETE /api/users/me */
    private LimitConfig accountDelete = new LimitConfig(3, 0, 1);

    // ── Shared limit types (unused here, kept for filter reuse) ──

    /** POST /api/expenses/import — CSV bulk import */
    private LimitConfig writeHeavy = new LimitConfig(5, 0, 1);

    // GET /api/{service}/summary/{period} — aggregation queries
    private LimitConfig summaryQueries = new LimitConfig(20, 1, 0);

    // ──────────────────────────────────────────────────────────────

    @Data
    public static class LimitConfig {

        /** Max tokens (= max requests) in the bucket. */
        private long tokens;

        /** Refill period in minutes. Use 0 when refillHours is set. */
        private long refillMinutes;

        /** Refill period in hours. Use 0 when refillMinutes is set. */
        private long refillHours;

        public LimitConfig() {}

        public LimitConfig(long tokens, long refillMinutes, long refillHours) {
            this.tokens = tokens;
            this.refillMinutes = refillMinutes;
            this.refillHours = refillHours;
        }

        /**
         * Returns the effective refill Duration.
         * Hours take priority if both are non-zero.
         */
        public Duration getPeriod() {
            if (refillHours > 0) {
                return Duration.ofHours(refillHours);
            }
            return Duration.ofMinutes(refillMinutes > 0 ? refillMinutes : 1);
        }
    }
}
