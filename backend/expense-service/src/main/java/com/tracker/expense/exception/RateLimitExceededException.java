package com.tracker.expense.exception;

/**
 * Thrown when a client exceeds the configured request rate limit.
 * Results in HTTP 429 Too Many Requests.
 * The filter handles 429 directly; this exception acts as a safety net
 * if rate limiting is enforced from the service layer.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException() {
        super("Too many requests. Please try again later.");
    }

    public RateLimitExceededException(String message) {
        super(message);
    }
}
