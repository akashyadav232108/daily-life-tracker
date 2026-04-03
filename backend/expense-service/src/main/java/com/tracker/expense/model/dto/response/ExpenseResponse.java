package com.tracker.expense.model.dto.response;

import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.PaymentMethod;
import com.tracker.expense.model.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private Long userId;
    private TransactionType type;
    private BigDecimal amount;
    private Category category;
    private String description;
    private PaymentMethod paymentMethod;
    private LocalDate expenseDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
