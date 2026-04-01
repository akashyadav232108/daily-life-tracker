import { useDispatch } from 'react-redux';
import { completeTask, reopenTask } from '../taskSlice';
import { PRIORITY_COLORS, STATUS_LABELS, RECURRENCE_LABELS } from '../../../utils/constants';
import { formatDate, isOverdue } from '../../../utils/dateUtils';
import {
  HiCheck,
  HiArrowPath,
  HiPencilSquare,
  HiTrash,
  HiCalendarDays,
  HiArrowPathRoundedSquare,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

/**
 * Individual task card with actions: complete/reopen, edit, delete.
 *
 * Props:
 *   task      - TaskResponse object
 *   onEdit    - callback(task) to open edit modal
 *   onDelete  - callback(task) to trigger delete confirmation
 */
const TaskCard = ({ task, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  const isCompleted = task.status === 'COMPLETED';
  const overdue = !isCompleted && isOverdue(task.dueDate);
  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;

  const handleToggleStatus = async () => {
    try {
      if (isCompleted) {
        await dispatch(reopenTask(task.id)).unwrap();
        toast.success('Task reopened');
      } else {
        await dispatch(completeTask(task.id)).unwrap();
        toast.success('Task completed! 🎉');
      }
    } catch (error) {
      toast.error(error || 'Failed to update task status');
    }
  };

  return (
    <div
      className={`group relative rounded-xl border bg-white p-4 shadow-sm transition-all
                   hover:shadow-md ${isCompleted ? 'border-gray-200 opacity-75' : 'border-gray-200'}
                   ${overdue ? 'border-l-4 border-l-red-400' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* ── Checkbox (complete / reopen) ── */}
        <button
          onClick={handleToggleStatus}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors
                      ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
          title={isCompleted ? 'Reopen task' : 'Mark as completed'}
        >
          {isCompleted && <HiCheck className="h-3 w-3" />}
        </button>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3
            className={`text-sm font-semibold leading-snug ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className={`mt-1 text-xs leading-relaxed ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
              {task.description.length > 120
                ? `${task.description.substring(0, 120)}…`
                : task.description}
            </p>
          )}

          {/* Meta row: due date, priority badge, recurrence */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Due date */}
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium
                          ${overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
            >
              <HiCalendarDays className="h-3.5 w-3.5" />
              {formatDate(task.dueDate)}
              {overdue && ' (overdue)'}
            </span>

            {/* Priority badge */}
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}
            >
              {task.priority}
            </span>

            {/* Recurrence */}
            {task.recurrenceType && task.recurrenceType !== 'NONE' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                <HiArrowPathRoundedSquare className="h-3.5 w-3.5" />
                {RECURRENCE_LABELS[task.recurrenceType]}
              </span>
            )}

            {/* Status badge */}
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium
                          ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
          </div>

          {/* Completed-at timestamp */}
          {isCompleted && task.completedAt && (
            <p className="mt-2 text-xs text-gray-400">
              Completed on {formatDate(task.completedAt)}
            </p>
          )}
        </div>

        {/* ── Action buttons (visible on hover) ── */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!isCompleted && (
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary"
              title="Edit task"
            >
              <HiPencilSquare className="h-4 w-4" />
            </button>
          )}
          {isCompleted && (
            <button
              onClick={handleToggleStatus}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-yellow-600"
              title="Reopen task"
            >
              <HiArrowPath className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete task"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
