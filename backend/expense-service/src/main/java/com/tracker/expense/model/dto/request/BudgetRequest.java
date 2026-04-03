package com.tracker.expense.model.dto.request;

import com.tracker.expense.model.enums.Category;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    private Category category;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Monthly limit must be greater than 0")
    private BigDecimal monthlyLimit;

    /**
     * Month in "YYYY-MM" format, e.g. "2026-04".
     * If not provided, defaults to current month in the service layer.
     */
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "monthYear must be in YYYY-MM format")
    private String monthYear;
}
