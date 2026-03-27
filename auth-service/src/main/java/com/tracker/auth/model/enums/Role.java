package com.tracker.auth.model.enums;

public enum Role {
    USER,           // Default — can only manage own data
    ADMIN,          // Can view all users, manage accounts, view platform stats
    SUPER_ADMIN     // Full access — manage roles, delete users, system config
}
