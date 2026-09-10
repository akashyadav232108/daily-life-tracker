import { useNavigate } from 'react-router-dom';
import {
  HiClipboardDocumentList,
  HiHeart,
  HiBolt,
  HiCurrencyDollar,
  HiPlus,
  HiArrowRight,
} from 'react-icons/hi2';
import useAuth from '../../../hooks/useAuth';
import TodayTaskSummary from '../components/TodayTaskSummary';
import UpcomingTasks from '../components/UpcomingTasks';
import TodayHealthSummary from '../components/TodayHealthSummary';
import TodayWorkout from '../components/TodayWorkout';
import StreakWidget from '../../notifications/components/StreakWidget';

const quickActions = [
  {
    label: 'Tasks',
    description: 'Manage your daily to-dos',
    icon: HiClipboardDocumentList,
    to: '/tasks',
    gradient: 'from-blue-500 to-blue-600',
    hoverRing: 'hover:ring-4 hover:ring-blue-100',
    available: true,
  },
  {
    label: 'Health',
    description: 'Log health metrics',
    icon: HiHeart,
    to: '/health',
    gradient: 'from-pink-500 to-rose-500',
    hoverRing: 'hover:ring-4 hover:ring-pink-100',
    available: true,
  },
  {
    label: 'Exercise',
    description: 'Track your workouts',
    icon: HiBolt,
    to: '/exercise',
    gradient: 'from-orange-500 to-amber-500',
    hoverRing: 'hover:ring-4 hover:ring-orange-100',
    available: true,
  },
  {
    label: 'Expenses',
    description: 'Track income & spending',
    icon: HiCurrencyDollar,
    to: '/expenses',
    gradient: 'from-green-500 to-emerald-500',
    hoverRing: 'hover:ring-4 hover:ring-green-100',
    available: true,
  },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* ── Welcome header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{today}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {getGreeting()},{' '}
            <span className="text-primary">{user?.fullName?.split(' ')[0] || 'there'}</span>!
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's your daily overview</p>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98]"
          style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
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
              className={`group relative flex flex-col items-start gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 ${
                action.available
                  ? `hover:-translate-y-0.5 hover:shadow-lg ${action.hoverRing} border-gray-100 shadow-sm cursor-pointer`
                  : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${action.gradient}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{action.label}</h3>
                <p className="mt-0.5 text-sm text-gray-500">{action.description}</p>
              </div>
              {action.available && (
                <HiArrowRight className="absolute right-4 bottom-5 h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              )}
              {!action.available && (
                <span className="absolute top-3 right-3 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Expense widget ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Other Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/expenses')}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-4 hover:ring-green-100"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm">
              <HiCurrencyDollar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Today's Spending</h3>
              <p className="mt-0.5 text-sm text-gray-500">View expenses, budgets & monthly summary</p>
            </div>
            <HiArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-green-500" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
