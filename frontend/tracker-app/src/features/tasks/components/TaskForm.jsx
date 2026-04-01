import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, selectTasksLoading } from '../taskSlice';
import { PRIORITY_OPTIONS, RECURRENCE_OPTIONS } from '../../../utils/constants';
import { getTodayISO } from '../../../utils/dateUtils';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/**
 * Modal form for creating / editing a task.
 *
 * Props:
 *   isOpen       - controls visibility
 *   onClose      - close handler
 *   editingTask  - if provided, form opens in edit mode pre-filled with task data
 */
const TaskForm = ({ isOpen, onClose, editingTask = null }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectTasksLoading);

  const isEditing = !!editingTask;

  // ── Form state ──
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: getTodayISO(),
    recurrenceType: 'NONE',
  });

  // Pre-fill when editing
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'MEDIUM',
        dueDate: editingTask.dueDate || getTodayISO(),
        recurrenceType: editingTask.recurrenceType || 'NONE',
      });
    } else {
      // Reset for create mode
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: getTodayISO(),
        recurrenceType: 'NONE',
      });
    }
  }, [editingTask, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateTask({ taskId: editingTask.id, taskData: formData })).unwrap();
        toast.success('Task updated successfully');
      } else {
        await dispatch(createTask(formData)).unwrap();
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error || 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Complete project report"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                         placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Optional details about this task..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                         placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
            />
          </div>

          {/* Priority + Due Date row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                           focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {PRIORITY_OPTIONS.filter((o) => o.value !== '').map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                           focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label htmlFor="recurrenceType" className="mb-1 block text-sm font-medium text-gray-700">
              Recurrence
            </label>
            <select
              id="recurrenceType"
              name="recurrenceType"
              value={formData.recurrenceType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                         focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
                         hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm
                         hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
