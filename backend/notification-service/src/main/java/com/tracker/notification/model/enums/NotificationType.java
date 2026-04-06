package com.tracker.notification.model.enums;

public enum NotificationType {

    /** Fired when a task is completed */
    TASK_REMINDER,

    /** Fired when budget crosses 80% or 100% threshold */
    BUDGET_ALERT,

    /** Fired when HEALTH_LOG streak hits 7 / 14 / 30 days */
    HEALTH_STREAK,

    /** Fired when EXERCISE streak hits 7 / 14 / 30 days */
    EXERCISE_STREAK,

    /** Fired by morning scheduler — today's workout plan reminder */
    EXERCISE_REMINDER,

    /** Fired by evening scheduler — end-of-day summary */
    DAILY_SUMMARY
}
