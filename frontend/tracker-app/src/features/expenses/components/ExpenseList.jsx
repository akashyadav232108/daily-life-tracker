import { useDispatch } from 'react-redux';
import { deleteExpense } from '../expenseSlice';
import { CATEGORY_EMOJI } from '../../../utils/constants';
import { formatDate } from '../../../utils/dateUtils';
import { HiPencil, HiTrash, HiArrowDown, HiArrowUp } from 'react-icons/hi2';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Renders the list of expense/income entries.
 *
 * Props:
 *   expenses    - array of ExpenseResponse
 *   onEdit      - (expense) => void — opens edit modal
 *   loading     - boolean
 *   onAddClick  - () => void — shown in empty state
 */
const ExpenseList = ({ expenses = [], onEdit, loading, onAddClick }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteExpense(deleteTarget.id)).unwrap();
      toast.success('Entry deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return null; // parent shows spinner

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-14">
        <span className="text-4xl">💸</span>
        <h3 className="mt-3 text-base font-semibold text-gray-600">No entries found</h3>
        <p className="mt-1 text-sm text-gray-400">Add your first expense or income entry.</p>
        <button
          onClick={onAddClick}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          + Add Entry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Entry"
        message={`Delete this ${deleteTarget?.type?.toLowerCase()} of ₹${deleteTarget?.amount}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

// ─── Single Row ───────────────────────────────────────────────────

const ExpenseRow = ({ expense, onEdit, onDelete }) => {
  const isIncome = expense.type === 'INCOME';
  const emoji = CATEGORY_EMOJI[expense.category] || '📦';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Category icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
        {emoji}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {expense.description || expense.category}
          </p>
          {expense.paymentMethod && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {expense.paymentMethod}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {expense.category} · {formatDate(expense.expenseDate)}
        </p>
      </div>

      {/* Amount */}
      <div className={`flex items-center gap-1 font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? <HiArrowUp className="h-3.5 w-3.5" /> : <HiArrowDown className="h-3.5 w-3.5" />}
        <span className="text-sm">₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(expense)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          title="Edit"
        >
          <HiPencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <HiTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ExpenseList;
