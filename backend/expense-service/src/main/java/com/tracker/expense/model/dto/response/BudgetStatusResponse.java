package com.tracker.expense.model.dto.response;

import com.tracker.expense.model.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusResponse {
    private Long budgetId;
    private Category category;
    private BigDecimal monthlyLimit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double percentUsed;
    private String monthYear;
}
