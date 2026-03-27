package com.tracker.auth.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private Map<String, Long> roleDistribution;  // e.g. {"USER": 50, "ADMIN": 3, "SUPER_ADMIN": 1}
}
