import { useNavigate } from 'react-router-dom';
import {
  HiClipboardDocumentList,
  HiHeart,
  HiBolt,
  HiCurrencyDollar,
} from 'react-icons/hi2';
import useAuth from '../../../hooks/useAuth';

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
    available: false,
  },
  {
    label: 'Exercise',
    description: 'Track your workouts',
    icon: HiBolt,
    to: '/exercise',
    color: 'bg-orange-500',
    available: false,
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
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.fullName || 'there'}!
        </h1>
        <p className="mt-1 text-gray-500">Here's your daily overview</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
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
      </div>

      {/* Placeholder summary cards */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-gray-400">
          Dashboard summary, streaks, and insights will appear here once more services are
          integrated.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
