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
    available: false,
  },
];

// ─── Placeholder widgets for modules not yet implemented ─
const comingSoonWidgets = [
  {
    title: "Today's Spending",
    description: 'Expense summaries and budget status will appear here.',
    icon: HiCurrencyDollar,
    color: 'text-green-400',
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

      {/* ── Coming-soon service widgets ── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Other Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonWidgets.map((widget) => (
            <div
              key={widget.title}
              className="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white p-6"
            >
              <widget.icon className={`h-8 w-8 ${widget.color}`} />
              <h3 className="mt-3 font-semibold text-gray-700">{widget.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{widget.description}</p>
              <span className="absolute top-3 right-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
