package com.tracker.notification.model.enums;

public enum StreakType {

    /** User logs health data (vitals, mood) at least once per day */
    HEALTH_LOG,

    /** User completes at least 1 task per day */
    TASK_COMPLETE,

    /** User logs at least 1 exercise per day (rest days excluded from breaking streak) */
    EXERCISE
}
