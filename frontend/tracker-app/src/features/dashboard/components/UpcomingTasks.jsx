import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowRight,
  HiExclamationTriangle,
  HiCalendarDays,
  HiCheckCircle,
} from 'react-icons/hi2';
import { fetchTasks } from '../../tasks/taskAPI';
import { formatDate, isOverdue, isToday } from '../../../utils/dateUtils';
import { PRIORITY_COLORS } from '../../../utils/constants';
import LoadingSpinner from '../../../components/LoadingSpinner';

const MAX_ITEMS = 5;

const UpcomingTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch this week's PENDING tasks to get upcoming + overdue
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
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <LoadingSpinner className="h-32" />
      </div>
    );
  }

  // Sort: overdue first, then by dueDate ascending
  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate) ? 0 : 1;
    const bOverdue = isOverdue(b.dueDate) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const visible = sorted.slice(0, MAX_ITEMS);
  const remaining = sorted.length - MAX_ITEMS;

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all <HiArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <HiCheckCircle className="mx-auto h-10 w-10 text-green-300" />
            <p className="mt-2 text-sm text-gray-500">
              All caught up! No pending tasks this week.
            </p>
          </div>
        ) : (
          visible.map((task) => {
            const taskOverdue = isOverdue(task.dueDate);
            const taskToday = isToday(task.dueDate);
            const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-gray-50 ${
                  taskOverdue ? 'bg-red-50/40' : ''
                }`}
              >
                {/* Priority dot */}
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${priority.badge}`}
                />

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                    <HiCalendarDays className="h-3.5 w-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                    {task.recurrenceType !== 'NONE' && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        {task.recurrenceType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badges */}
                {taskOverdue ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <HiExclamationTriangle className="h-3 w-3" />
                    Overdue
                  </span>
                ) : taskToday ? (
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Today
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Upcoming
                  </span>
                )}
              </div>
            );
          })
        )}

        {remaining > 0 && (
          <button
            onClick={() => navigate('/tasks')}
            className="block w-full py-3 text-center text-sm font-medium text-primary hover:bg-gray-50"
          >
            + {remaining} more task{remaining !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;
