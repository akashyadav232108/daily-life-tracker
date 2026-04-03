package com.tracker.expense.model.dto.request;

import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.PaymentMethod;
import com.tracker.expense.model.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private Category category;

    private String description;

    private PaymentMethod paymentMethod;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;
}
