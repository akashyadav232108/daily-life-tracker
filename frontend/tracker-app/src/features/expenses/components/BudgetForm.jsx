import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBudget, updateBudget, selectExpenseLoading } from '../expenseSlice';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/**
 * Modal form for setting / updating a monthly budget.
 *
 * Props:
 *   isOpen         - controls visibility
 *   onClose        - close handler
 *   editingBudget  - if provided, pre-fill the form (edit mode)
 *   currentMonth   - "YYYY-MM" string (default month to pre-fill)
 */
const BudgetForm = ({ isOpen, onClose, editingBudget = null, currentMonth }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectExpenseLoading);
  const isEditing = !!editingBudget;

  const [formData, setFormData] = useState(() => ({
    category: editingBudget?.category || 'FOOD',
    monthlyLimit: editingBudget?.monthlyLimit || '',
    monthYear: editingBudget?.monthYear || currentMonth || '',
  }));

  // Re-sync when editingBudget changes
  useState(() => {
    setFormData({
      category: editingBudget?.category || 'FOOD',
      monthlyLimit: editingBudget?.monthlyLimit || '',
      monthYear: editingBudget?.monthYear || currentMonth || '',
    });
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monthlyLimit || Number(formData.monthlyLimit) <= 0) {
      toast.error('Monthly limit must be greater than 0');
      return;
    }

    const payload = {
      ...formData,
      monthlyLimit: parseFloat(formData.monthlyLimit),
    };

    try {
      if (isEditing) {
        await dispatch(updateBudget({ id: editingBudget.id, data: payload })).unwrap();
        toast.success('Budget updated');
      } else {
        await dispatch(createBudget(payload)).unwrap();
        toast.success('Budget set successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to save budget');
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm ' +
    'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Update Budget' : 'Set Monthly Budget'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Category */}
          {!isEditing && (
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Monthly Limit */}
          <div>
            <label htmlFor="monthlyLimit" className="mb-1 block text-sm font-medium text-gray-700">
              Monthly Limit (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                id="monthlyLimit"
                name="monthlyLimit"
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="e.g. 5000"
                value={formData.monthlyLimit}
                onChange={handleChange}
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>

          {/* Month */}
          <div>
            <label htmlFor="monthYear" className="mb-1 block text-sm font-medium text-gray-700">
              Month
            </label>
            <input
              id="monthYear"
              name="monthYear"
              type="month"
              value={formData.monthYear}
              onChange={handleChange}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">Leave blank to use current month</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
