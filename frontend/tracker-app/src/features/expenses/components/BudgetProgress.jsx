import { useDispatch } from 'react-redux';
import { deleteBudget } from '../expenseSlice';
import { CATEGORY_EMOJI } from '../../../utils/constants';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Displays budget progress bars for each category.
 * Color logic: green < 60%, yellow 60–80%, red > 80%
 *
 * Props:
 *   budgetStatus  - array of BudgetStatusResponse
 *   budgets       - array of BudgetResponse (for edit/delete)
 *   onAddBudget   - () => void
 *   onEditBudget  - (budget) => void
 */
const BudgetProgress = ({ budgetStatus = [], budgets = [], onAddBudget, onEditBudget }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteBudget(deleteTarget.id)).unwrap();
      toast.success('Budget deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete budget');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Find the Budget entity (has id) from budgetStatus entry (has budgetId)
  const findBudget = (budgetId) => budgets.find((b) => b.id === budgetId);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Budget Status</h3>
        <button
          onClick={onAddBudget}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <HiPlus className="h-3.5 w-3.5" />
          Set Budget
        </button>
      </div>

      {budgetStatus.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-3xl">🎯</p>
          <p className="mt-2 text-sm font-medium text-gray-600">No budgets set</p>
          <p className="mt-1 text-xs text-gray-400">
            Set spending limits for each category to track your progress.
          </p>
          <button
            onClick={onAddBudget}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Set First Budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetStatus.map((item) => {
            const budget = findBudget(item.budgetId);
            return (
              <BudgetBar
                key={item.budgetId}
                item={item}
                budget={budget}
                onEdit={() => budget && onEditBudget(budget)}
                onDelete={() => budget && setDeleteTarget(budget)}
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Budget"
        message={`Delete the budget for ${deleteTarget?.category}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ─── Single Budget Bar ───────────────────────────────────────────

const BudgetBar = ({ item, budget, onEdit, onDelete }) => {
  const percent = Math.min(item.percentUsed ?? 0, 100);
  const emoji = CATEGORY_EMOJI[item.category] || '📦';

  // Color: green < 60, yellow 60-80, red > 80
  const barColor =
    percent >= 80
      ? 'bg-red-500'
      : percent >= 60
      ? 'bg-yellow-400'
      : 'bg-green-500';

  const textColor =
    percent >= 80
      ? 'text-red-600'
      : percent >= 60
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium text-gray-800">{item.category}</span>
          {percent >= 100 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
              EXCEEDED
            </span>
          )}
          {percent >= 80 && percent < 100 && (
            <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">
              80%+ ⚠️
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${textColor}`}>
            ₹{Number(item.spent).toLocaleString('en-IN')} / ₹{Number(item.monthlyLimit).toLocaleString('en-IN')}
          </span>
          <div className="hidden gap-1 group-hover:flex">
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              title="Edit budget"
            >
              <HiPencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
              title="Delete budget"
            >
              <HiTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{percent.toFixed(1)}% used</span>
        <span>
          {Number(item.remaining) > 0
            ? `₹${Number(item.remaining).toLocaleString('en-IN')} remaining`
            : 'Over budget!'}
        </span>
      </div>
    </div>
  );
};

export default BudgetProgress;
