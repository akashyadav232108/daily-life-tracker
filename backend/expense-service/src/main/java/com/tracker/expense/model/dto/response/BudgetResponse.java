package com.tracker.expense.model.dto.response;

import com.tracker.expense.model.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private Long id;
    private Long userId;
    private Category category;
    private BigDecimal monthlyLimit;
    private String monthYear;
    private OffsetDateTime createdAt;
}
