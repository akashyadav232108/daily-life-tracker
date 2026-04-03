import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense, updateExpense, selectExpenseLoading } from '../expenseSlice';
import {
  TRANSACTION_TYPES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from '../../../utils/constants';
import { getTodayISO } from '../../../utils/dateUtils';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/**
 * Modal form for adding or editing an expense/income entry.
 *
 * Props:
 *   isOpen        - controls visibility
 *   onClose       - close handler (re-fetches data after close)
 *   editingExpense - if provided, form is in edit mode pre-filled with data
 */
const ExpenseForm = ({ isOpen, onClose, editingExpense = null }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectExpenseLoading);
  const isEditing = !!editingExpense;

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'FOOD',
    description: '',
    paymentMethod: 'UPI',
    expenseDate: getTodayISO(),
  });

  // Pre-fill in edit mode
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        type: editingExpense.type || 'EXPENSE',
        amount: editingExpense.amount || '',
        category: editingExpense.category || 'FOOD',
        description: editingExpense.description || '',
        paymentMethod: editingExpense.paymentMethod || 'UPI',
        expenseDate: editingExpense.expenseDate || getTodayISO(),
      });
    } else {
      setFormData({
        type: 'EXPENSE',
        amount: '',
        category: 'FOOD',
        description: '',
        paymentMethod: 'UPI',
        expenseDate: getTodayISO(),
      });
    }
  }, [editingExpense, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      if (isEditing) {
        await dispatch(updateExpense({ id: editingExpense.id, data: payload })).unwrap();
        toast.success('Entry updated successfully');
      } else {
        await dispatch(addExpense(payload)).unwrap();
        toast.success(payload.type === 'INCOME' ? 'Income added!' : 'Expense added!');
      }
      onClose();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm ' +
    'placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Entry' : 'Add Entry'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Type Toggle */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {TRANSACTION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, type: t.value }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    formData.type === t.value
                      ? t.value === 'EXPENSE'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.value === 'EXPENSE' ? '↓ ' : '↑ '}{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>

          {/* Category + Payment Method */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-gray-700">
                Payment
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={inputClass}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="expenseDate" className="mb-1 block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="expenseDate"
              name="expenseDate"
              type="date"
              required
              value={formData.expenseDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              maxLength={255}
              placeholder="Optional note..."
              value={formData.description}
              onChange={handleChange}
              className={inputClass}
            />
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
              className={`rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors
                disabled:cursor-not-allowed disabled:opacity-50
                ${formData.type === 'INCOME'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'}`}
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : formData.type === 'INCOME' ? 'Add Income' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
