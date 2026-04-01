import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
  HiArrowRight,
} from 'react-icons/hi2';
import { fetchTasks } from '../../tasks/taskAPI';
import { isOverdue } from '../../../utils/dateUtils';
import LoadingSpinner from '../../../components/LoadingSpinner';

const TodayTaskSummary = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchTasks({ view: 'today' });
        setTasks(response.data || []);
      } catch {
        // silently fail — dashboard is not critical
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

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const overdue = tasks.filter(
    (t) => t.status === 'PENDING' && isOverdue(t.dueDate)
  ).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all <HiArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6">
        {total === 0 ? (
          /* No tasks today */
          <div className="py-4 text-center">
            <HiCheckCircle className="mx-auto h-10 w-10 text-green-300" />
            <p className="mt-2 text-sm text-gray-500">
              No tasks scheduled for today. Enjoy your free time!
            </p>
            <button
              onClick={() => navigate('/tasks')}
              className="mt-3 text-sm font-medium text-primary hover:text-primary-dark"
            >
              + Add a task
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-end justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {completed} of {total} completed
                </span>
                <span className="text-2xl font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-3">
              <StatPill
                icon={HiClock}
                label="Pending"
                value={pending}
                colorClass="bg-blue-50 text-blue-600"
              />
              <StatPill
                icon={HiCheckCircle}
                label="Done"
                value={completed}
                colorClass="bg-green-50 text-green-600"
              />
              <StatPill
                icon={HiExclamationTriangle}
                label="Overdue"
                value={overdue}
                colorClass={overdue > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatPill = ({ icon: Icon, label, value, colorClass }) => (
  <div className={`flex items-center gap-2 rounded-lg p-3 ${colorClass}`}>
    <Icon className="h-5 w-5 shrink-0" />
    <div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-75">{label}</p>
    </div>
  </div>
);

export default TodayTaskSummary;
