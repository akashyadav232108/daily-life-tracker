package com.tracker.expense.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response returned after a CSV bulk import.
 * Reports how many rows succeeded, how many failed, and per-row errors.
 */
@Data
@Builder
public class CsvImportResponse {

    /** Total rows found in the CSV (excluding header). */
    private int totalRows;

    /** Rows that were successfully imported. */
    private int imported;

    /** Rows that were skipped due to errors. */
    private int skipped;

    /** Per-row error details. */
    private List<RowError> errors;

    /** Successfully imported expense records. */
    private List<ExpenseResponse> expenses;

    @Data
    @Builder
    public static class RowError {
        private int row;
        private String reason;
    }
}
