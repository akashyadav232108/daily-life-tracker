import { useNavigate } from 'react-router-dom';
import {
  HiClipboardDocumentList,
  HiHeart,
  HiBolt,
  HiCurrencyDollar,
  HiPlus,
} from 'react-icons/hi2';
import useAuth from '../../../hooks/useAuth';
import TodayTaskSummary from '../components/TodayTaskSummary';
import UpcomingTasks from '../components/UpcomingTasks';
import TodayHealthSummary from '../components/TodayHealthSummary';
import TodayWorkout from '../components/TodayWorkout';
import StreakWidget from '../../notifications/components/StreakWidget';

// ─── Quick-action cards ─────────────────────────────────────────
const quickActions = [
  {
    label: 'Tasks',
    description: 'Manage your daily to-dos',
    icon: HiClipboardDocumentList,
    to: '/tasks',
    color: 'bg-blue-500',
    available: true,
  },
  {
    label: 'Health',
    description: 'Log health metrics',
    icon: HiHeart,
    to: '/health',
    color: 'bg-pink-500',
    available: true,
  },
  {
    label: 'Exercise',
    description: 'Track your workouts',
    icon: HiBolt,
    to: '/exercise',
    color: 'bg-orange-500',
    available: true,
  },
  {
    label: 'Expenses',
    description: 'Track income & spending',
    icon: HiCurrencyDollar,
    to: '/expenses',
    color: 'bg-green-500',
    available: true,
  },
];


// ─── Page ─────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* ── Welcome header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.fullName || 'there'}!
          </h1>
          <p className="mt-1 text-gray-500">Here's your daily overview</p>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          <HiPlus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* ── Live task widgets ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayTaskSummary />
        <UpcomingTasks />
      </div>

      {/* ── Health & Exercise ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayHealthSummary />
        <TodayWorkout />
      </div>

      {/* ── Streaks ── */}
      <StreakWidget />

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => action.available && navigate(action.to)}
              disabled={!action.available}
              className={`group relative flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all ${
                action.available
                  ? 'border-gray-200 bg-white shadow-sm hover:border-primary/30 hover:shadow-md'
                  : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{action.label}</h3>
                <p className="mt-0.5 text-sm text-gray-500">{action.description}</p>
              </div>
              {!action.available && (
                <span className="absolute top-3 right-3 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Expense quick-link widget ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Other Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/expenses')}
            className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-green-300 hover:shadow-md"
          >
            <HiCurrencyDollar className="h-8 w-8 text-green-500" />
            <h3 className="font-semibold text-gray-900">Today's Spending</h3>
            <p className="text-sm text-gray-500">View expenses, budgets & monthly summary →</p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
