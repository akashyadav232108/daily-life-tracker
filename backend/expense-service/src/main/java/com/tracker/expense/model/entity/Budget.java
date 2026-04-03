package com.tracker.expense.model.entity;

import com.tracker.expense.model.enums.Category;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "budgets",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_budget_user_category_month",
            columnNames = {"user_id", "category", "month_year"}
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private Category category;

    /**
     * Monthly spending limit set by the user for this category.
     */
    @Column(name = "monthly_limit", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyLimit;

    /**
     * Month in "YYYY-MM" format, e.g. "2026-04".
     */
    @Column(name = "month_year", nullable = false, length = 7)
    private String monthYear;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
