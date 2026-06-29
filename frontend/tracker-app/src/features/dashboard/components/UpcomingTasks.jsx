import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowRight,
  HiExclamationTriangle,
  HiCalendarDays,
  HiCheckCircle,
  HiClipboardDocumentList,
} from 'react-icons/hi2';
import { fetchTasks } from '../../tasks/taskAPI';
import { formatDate, isOverdue, isToday } from '../../../utils/dateUtils';
import { PRIORITY_COLORS } from '../../../utils/constants';
import LoadingSpinner from '../../../components/LoadingSpinner';

const MAX_ITEMS = 5;

// Left border color by priority
const priorityBorder = {
  HIGH:   'border-l-red-500',
  MEDIUM: 'border-l-yellow-500',
  LOW:    'border-l-green-500',
};

const UpcomingTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── All data-fetching logic unchanged ──
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchTasks({ view: 'week', status: 'PENDING' });
        setTasks(response.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <LoadingSpinner className="h-32" />
      </div>
    );
  }

  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate) ? 0 : 1;
    const bOverdue = isOverdue(b.dueDate) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const visible   = sorted.slice(0, MAX_ITEMS);
  const remaining = sorted.length - MAX_ITEMS;

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <HiClipboardDocumentList className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Upcoming Tasks</h2>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all
          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <HiCheckCircle className="h-7 w-7 text-green-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">All caught up!</p>
            <p className="mt-0.5 text-xs text-gray-400">No pending tasks this week.</p>
          </div>
        ) : (
          <>
            {visible.map((task) => {
              const taskOverdue = isOverdue(task.dueDate);
              const taskToday   = isToday(task.dueDate);
              const priority    = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
              const borderClass = priorityBorder[task.priority] || 'border-l-gray-300';

              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 border-l-4 pl-4 pr-6 py-3.5 transition-colors hover:bg-gray-50 ${borderClass} ${
                    taskOverdue ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Task info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <HiCalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(task.dueDate)}</span>
                      {task.recurrenceType !== 'NONE' && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          {task.recurrenceType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  {taskOverdue ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      <HiExclamationTriangle className="h-3 w-3" /> Overdue
                    </span>
                  ) : taskToday ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Today
                    </span>
                  ) : null}
                </div>
              );
            })}

            {remaining > 0 && (
              <button
                onClick={() => navigate('/tasks')}
                className="flex w-full items-center justify-center gap-1 py-3.5 text-xs font-medium text-gray-400 hover:text-primary transition-colors"
              >
                +{remaining} more tasks
                <HiArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;
