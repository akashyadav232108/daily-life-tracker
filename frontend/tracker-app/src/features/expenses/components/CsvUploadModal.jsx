import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  importExpensesFromCsv,
  clearImportResult,
  selectImporting,
  selectImportResult,
  fetchExpenses,
  fetchMonthlySummary,
  fetchBudgetStatus,
  selectExpenseFilters,
} from '../expenseSlice';
import {
  HiArrowUpTray,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiDocumentText,
  HiArrowDownTray,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useRequireAuth } from '../../../contexts/RegisterPromptContext';

// ─── CSV Template Download ─────────────────────────────────────────
const TEMPLATE_HEADERS = 'date,type,amount,description,category,payment_method';
const TEMPLATE_ROWS = [
  '2026-04-01,EXPENSE,1500.00,Swiggy order,FOOD,UPI',
  '2026-04-02,INCOME,50000.00,Monthly salary,SALARY,BANK_TRANSFER',
  '2026-04-03,EXPENSE,800.00,Ola cab to office,TRANSPORT,UPI',
  '2026-04-04,EXPENSE,299.00,Netflix subscription,ENTERTAINMENT,CARD',
  '2026-04-05,EXPENSE,2000.00,Amazon shopping,,',
].join('\n');

const downloadTemplate = () => {
  const content = TEMPLATE_HEADERS + '\n' + TEMPLATE_ROWS;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Component ─────────────────────────────────────────────────────

export default function CsvUploadModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { requireAuth } = useRequireAuth();
  const importing = useSelector(selectImporting);
  const importResult = useSelector(selectImportResult);
  const filters = useSelector(selectExpenseFilters);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      dispatch(clearImportResult());
    }
  }, [isOpen, dispatch]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please select a CSV file (.csv)');
      return;
    }
    setSelectedFile(file);
    dispatch(clearImportResult());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    if (!requireAuth()) return;
    const result = await dispatch(importExpensesFromCsv(selectedFile));
    if (importExpensesFromCsv.fulfilled.match(result)) {
      const { imported, skipped } = result.payload;
      toast.success(`Imported ${imported} rows${skipped > 0 ? `, ${skipped} skipped` : ''}`);
      // Refresh expenses, summary and budget status
      dispatch(fetchExpenses(filters));
      dispatch(fetchMonthlySummary());
      dispatch(fetchBudgetStatus());
    } else {
      toast.error(result.payload || 'Import failed');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    dispatch(clearImportResult());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel — capped to viewport; body scrolls so header/footer stay visible */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
        className="relative z-10 flex w-full max-w-lg max-h-[92vh] flex-col overflow-hidden
                   rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        {/* Header — sticky */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <HiArrowUpTray className="h-5 w-5 shrink-0 text-primary" />
            <h2 id="csv-import-title" className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              Import from CSV
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {/* Format guide */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 sm:p-4">
            <p className="mb-1 font-medium">CSV Format (header row required)</p>
            <code className="block overflow-x-auto rounded bg-blue-100 px-2 py-1 font-mono text-[11px]
                             leading-relaxed whitespace-nowrap sm:text-xs">
              date, type, amount, description, category, payment_method
            </code>
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-blue-700">
              <li><strong>date</strong> — YYYY-MM-DD (required)</li>
              <li><strong>type</strong> — INCOME or EXPENSE (required)</li>
              <li><strong>amount</strong> — positive number (required)</li>
              <li><strong>description</strong> — free text (optional)</li>
              <li><strong>category</strong> — leave blank for auto-detect (optional)</li>
              <li><strong>payment_method</strong> — CASH, UPI, CARD, BANK_TRANSFER (optional)</li>
            </ul>
          </div>

          {/* Template download */}
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-primary transition-colors hover:underline"
          >
            <HiArrowDownTray className="h-4 w-4 shrink-0" />
            Download sample template
          </button>

          {/* Drop zone — tighter padding on small screens */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors
                        sm:p-8
              ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <HiDocumentText className="h-9 w-9 text-primary sm:h-10 sm:w-10" />
                <p className="max-w-full truncate font-medium text-gray-800 px-2">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <HiArrowUpTray className="h-9 w-9 sm:h-10 sm:w-10" />
                <p className="px-2 text-sm font-medium sm:text-base">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-xs">Only .csv files accepted</p>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                {importResult.skipped === 0 ? (
                  <HiCheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <HiExclamationTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {importResult.imported} of {importResult.totalRows} rows imported
                  {importResult.skipped > 0 && (
                    <span className="ml-1 text-yellow-600">({importResult.skipped} skipped)</span>
                  )}
                </p>
              </div>

              {importResult.errors?.length > 0 && (
                <div className="max-h-28 space-y-1 overflow-y-auto sm:max-h-36">
                  {importResult.errors.map((e) => (
                    <div key={e.row} className="flex gap-2 text-xs text-red-600">
                      <span className="shrink-0 font-medium">Row {e.row}:</span>
                      <span>{e.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — sticky */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {!importResult && (
            <button
              type="button"
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white
                         transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importing…
                </>
              ) : (
                <>
                  <HiArrowUpTray className="h-4 w-4" />
                  Import
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
