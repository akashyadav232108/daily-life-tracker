package com.tracker.expense.repository;

import com.tracker.expense.model.entity.Expense;
import com.tracker.expense.model.enums.Category;
import com.tracker.expense.model.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Fetch all expenses for a user filtered by date range, type, and category.
     * Null parameters are ignored (acts as "no filter").
     */
    @Query("""
            SELECT e FROM Expense e
            WHERE e.userId = :userId
              AND (:from IS NULL OR e.expenseDate >= :from)
              AND (:to   IS NULL OR e.expenseDate <= :to)
              AND (:type IS NULL OR e.type = :type)
              AND (:category IS NULL OR e.category = :category)
            ORDER BY e.expenseDate DESC, e.createdAt DESC
            """)
    List<Expense> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("type") TransactionType type,
            @Param("category") Category category
    );

    /**
     * Sum of EXPENSE type amounts for a user in a given category within a date range (current month).
     * Used for budget threshold checks when Redis cache misses.
     */
    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.userId = :userId
              AND e.category = :category
              AND e.type = 'EXPENSE'
              AND e.expenseDate >= :from
              AND e.expenseDate <= :to
            """)
    BigDecimal sumExpenseByUserAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") Category category,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Sum of all EXPENSE amounts for a user in a date range (for monthly summary).
     */
    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.userId = :userId
              AND e.type = 'EXPENSE'
              AND e.expenseDate >= :from
              AND e.expenseDate <= :to
            """)
    BigDecimal sumTotalExpenseByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Sum of all INCOME amounts for a user in a date range (for monthly summary).
     */
    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.userId = :userId
              AND e.type = 'INCOME'
              AND e.expenseDate >= :from
              AND e.expenseDate <= :to
            """)
    BigDecimal sumTotalIncomeByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Fetch all expenses for a specific user (admin view).
     */
    List<Expense> findByUserIdOrderByExpenseDateDescCreatedAtDesc(Long userId);

    /**
     * Per-category EXPENSE breakdown for a user within a date range.
     * Returns [Category, BigDecimal] pairs.
     */
    @Query("""
            SELECT e.category, COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.userId = :userId
              AND e.type = 'EXPENSE'
              AND e.expenseDate >= :from
              AND e.expenseDate <= :to
            GROUP BY e.category
            """)
    List<Object[]> findCategoryBreakdownByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Platform-wide stats for admins: total expense amount across all users.
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.type = 'EXPENSE'")
    BigDecimal sumAllExpenses();

    /**
     * Count distinct users who have recorded at least one expense.
     */
    @Query("SELECT COUNT(DISTINCT e.userId) FROM Expense e")
    Long countDistinctUsers();

    /**
     * Top categories by total spend (all users, all time).
     */
    @Query("""
            SELECT e.category, COALESCE(SUM(e.amount), 0) as total
            FROM Expense e
            WHERE e.type = 'EXPENSE'
            GROUP BY e.category
            ORDER BY total DESC
            """)
    List<Object[]> findTopCategories();
}
