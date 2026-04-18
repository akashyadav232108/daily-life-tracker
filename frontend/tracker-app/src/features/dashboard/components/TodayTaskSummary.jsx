import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
  HiArrowRight,
  HiClipboardDocumentList,
} from 'react-icons/hi2';
import { fetchTasks } from '../../tasks/taskAPI';
import { isOverdue } from '../../../utils/dateUtils';
import LoadingSpinner from '../../../components/LoadingSpinner';

const TodayTaskSummary = () => {
  const navigate = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  // ── All data-fetching logic unchanged ──
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
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <LoadingSpinner className="h-32" />
      </div>
    );
  }

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending   = tasks.filter((t) => t.status === 'PENDING').length;
  const overdue   = tasks.filter((t) => t.status === 'PENDING' && isOverdue(t.dueDate)).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <HiClipboardDocumentList className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Today's Tasks</h2>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all
          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="p-6">
        {total === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <HiCheckCircle className="h-7 w-7 text-green-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">All clear for today!</p>
            <p className="mt-0.5 text-xs text-gray-400">No tasks scheduled. Enjoy your free time!</p>
            <button
              onClick={() => navigate('/tasks')}
              className="mt-4 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
            >
              + Add a task
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-5">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{completed}</span> of {total} completed
                </span>
                <span className="text-2xl font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                  }}
                />
              </div>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-3">
              <StatPill icon={HiClock}              label="Pending"  value={pending}   colorClass="bg-blue-50 text-blue-700"  />
              <StatPill icon={HiCheckCircle}        label="Done"     value={completed} colorClass="bg-green-50 text-green-700" />
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
  <div className={`flex items-center gap-2.5 rounded-xl p-3 ${colorClass}`}>
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-70">{label}</p>
    </div>
  </div>
);

export default TodayTaskSummary;
