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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <HiArrowUpTray className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Import from CSV</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">

          {/* Format guide */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">CSV Format (header row required)</p>
            <code className="block text-xs bg-blue-100 rounded px-2 py-1 font-mono break-all">
              date, type, amount, description, category, payment_method
            </code>
            <ul className="mt-2 space-y-0.5 text-xs text-blue-700 list-disc list-inside">
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
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <HiArrowDownTray className="h-4 w-4" />
            Download sample template
          </button>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors
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
                <HiDocumentText className="h-10 w-10 text-primary" />
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <HiArrowUpTray className="h-10 w-10" />
                <p className="font-medium">Drop your CSV here or click to browse</p>
                <p className="text-xs">Only .csv files accepted</p>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              {/* Summary */}
              <div className="flex items-center gap-2">
                {importResult.skipped === 0 ? (
                  <HiCheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <HiExclamationTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {importResult.imported} of {importResult.totalRows} rows imported
                  {importResult.skipped > 0 && (
                    <span className="ml-1 text-yellow-600">({importResult.skipped} skipped)</span>
                  )}
                </p>
              </div>

              {/* Per-row errors */}
              {importResult.errors?.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1">
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

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {!importResult && (
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white
                         hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
