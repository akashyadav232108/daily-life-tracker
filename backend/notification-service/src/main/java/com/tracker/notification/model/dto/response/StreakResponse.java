package com.tracker.notification.model.dto.response;

import com.tracker.notification.model.entity.Streak;
import com.tracker.notification.model.enums.StreakType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakResponse {

    private StreakType streakType;
    private Integer currentCount;
    private Integer longestCount;
    private LocalDate lastActiveDate;

    /** Map a Streak entity to its API response. */
    public static StreakResponse fromEntity(Streak streak) {
        return StreakResponse.builder()
                .streakType(streak.getStreakType())
                .currentCount(streak.getCurrentCount())
                .longestCount(streak.getLongestCount())
                .lastActiveDate(streak.getLastActiveDate())
                .build();
    }
}
