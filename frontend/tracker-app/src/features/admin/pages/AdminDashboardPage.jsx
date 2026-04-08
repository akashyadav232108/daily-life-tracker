import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiShieldCheck,
  HiClipboardDocumentList,
  HiHeart,
  HiBolt,
  HiCurrencyDollar,
  HiArrowRight,
  HiArrowPath,
  HiClock,
  HiChartBar,
} from 'react-icons/hi2';
import {
  adminFetchUserStats,
  adminFetchTaskStats,
  adminFetchHealthStats,
  adminFetchExerciseStats,
  adminFetchExpenseStats,
} from '../adminAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';

// ─── Role badge styles ─────────────────────────────────────────────────────────
const ROLE_COLORS = {
  USER:        { bar: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-100'   },
  ADMIN:       { bar: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50'    },
  SUPER_ADMIN: { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50'  },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // ── Stats state — each loaded independently so a failure doesn't block others ──
  const [userStats,     setUserStats]     = useState(null);
  const [taskStats,     setTaskStats]     = useState(null);
  const [healthStats,   setHealthStats]   = useState(null);
  const [exerciseStats, setExerciseStats] = useState(null);
  const [expenseStats,  setExpenseStats]  = useState(null);

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch all stats in parallel ──
  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    const [users, tasks, health, exercise, expense] = await Promise.allSettled([
      adminFetchUserStats(),
      adminFetchTaskStats(),
      adminFetchHealthStats(),
      adminFetchExerciseStats(),
      adminFetchExpenseStats(),
    ]);

    if (users.status     === 'fulfilled') setUserStats(users.value?.data);
    if (tasks.status     === 'fulfilled') setTaskStats(tasks.value?.data);
    if (health.status    === 'fulfilled') setHealthStats(health.value?.data);
    if (exercise.status  === 'fulfilled') setExerciseStats(exercise.value?.data);
    if (expense.status   === 'fulfilled') setExpenseStats(expense.value?.data);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Greeting ──
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Role distribution helper ──
  const roleDist   = userStats?.roleDistribution || {};
  const totalUsers = userStats?.totalUsers || 0;
  const roleEntries = Object.entries(roleDist);

  // ── Expense totals ──
  const totalSpend = expenseStats?.totalExpenseAmount ?? null;
  const totalIncome = expenseStats?.totalIncomeAmount ?? null;

  // ── Task rate ──
  const completionRate = taskStats?.completionRate?.toFixed(1) ?? '—';

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingSpinner size="lg" className="py-32" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isSuperAdmin
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <HiShieldCheck className="h-3.5 w-3.5" />
              {user?.role?.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-400">
              Here's your platform overview
            </span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
        >
          <HiArrowPath className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── User Overview Stats ── */}
      <section>
        <SectionTitle>User Overview</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <OverviewCard
            label="Total Users"
            value={totalUsers}
            icon={<HiUsers className="h-5 w-5" />}
            color="bg-gray-50 text-gray-700"
          />
          <OverviewCard
            label="Active"
            value={userStats?.activeUsers ?? '—'}
            icon={<HiCheckCircle className="h-5 w-5" />}
            color="bg-green-50 text-green-700"
          />
          <OverviewCard
            label="Inactive"
            value={userStats?.inactiveUsers ?? '—'}
            icon={<HiXCircle className="h-5 w-5" />}
            color="bg-red-50 text-red-700"
          />
          <OverviewCard
            label="Admins"
            value={
              userStats
                ? (roleDist.ADMIN ?? 0) + (roleDist.SUPER_ADMIN ?? 0)
                : '—'
            }
            icon={<HiShieldCheck className="h-5 w-5" />}
            color="bg-purple-50 text-purple-700"
          />
        </div>
      </section>

      {/* ── Role Distribution ── */}
      {userStats && totalUsers > 0 && (
        <section>
          <SectionTitle>Role Distribution</SectionTitle>
          <div className="mt-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="space-y-3">
              {roleEntries.map(([role, count]) => {
                const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                const colors = ROLE_COLORS[role] || ROLE_COLORS.USER;
                return (
                  <div key={role} className="flex items-center gap-3">
                    {/* Role label */}
                    <span className={`w-28 shrink-0 text-xs font-medium ${colors.text}`}>
                      {role.replace('_', ' ')}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                    {/* Count + % */}
                    <span className="w-16 shrink-0 text-right text-xs text-gray-500">
                      {count} <span className="text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Platform Activity Grid ── */}
      <section>
        <SectionTitle>Platform Activity</SectionTitle>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Task stats */}
          <ActivityCard
            title="Tasks"
            icon={<HiClipboardDocumentList className="h-5 w-5" />}
            iconBg="bg-blue-500"
            rows={[
              { label: 'Total',      value: taskStats?.totalTasks     ?? '—' },
              { label: 'Completed',  value: taskStats?.completedTasks ?? '—' },
              { label: 'Pending',    value: taskStats?.pendingTasks   ?? '—' },
              {
                label: 'Completion',
                value: taskStats ? `${completionRate}%` : '—',
                highlight: true,
              },
            ]}
          />

          {/* Health stats */}
          <ActivityCard
            title="Health (7 days)"
            icon={<HiHeart className="h-5 w-5" />}
            iconBg="bg-rose-500"
            rows={[
              { label: 'Logs recorded',   value: healthStats?.totalLogs7d      ?? '—' },
              { label: 'Active loggers',  value: healthStats?.activeLoggers7d  ?? '—' },
              {
                label: 'Moods tracked',
                value: Object.keys(healthStats?.moodDistribution7d || {}).length || '—',
              },
            ]}
          />

          {/* Exercise stats */}
          <ActivityCard
            title="Exercise"
            icon={<HiBolt className="h-5 w-5" />}
            iconBg="bg-orange-500"
            rows={[
              { label: 'Active plans', value: exerciseStats?.activePlans ?? '—' },
              {
                label: 'Muscle entries',
                value: Object.values(exerciseStats?.popularMuscleGroups || {}).reduce(
                  (a, b) => a + b,
                  0
                ) || '—',
              },
            ]}
          />

          {/* Expense stats */}
          <ActivityCard
            title="Expenses"
            icon={<HiCurrencyDollar className="h-5 w-5" />}
            iconBg="bg-green-500"
            rows={[
              {
                label: 'Total spend',
                value: totalSpend != null
                  ? `₹${Number(totalSpend).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  : '—',
              },
              {
                label: 'Total income',
                value: totalIncome != null
                  ? `₹${Number(totalIncome).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  : '—',
              },
            ]}
          />

        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <QuickActionCard
            title="User Management"
            description="View all users, activate/deactivate accounts, manage roles."
            icon={<HiUsers className="h-6 w-6" />}
            iconBg="bg-indigo-500"
            onClick={() => navigate('/admin/users')}
          />

          <QuickActionCard
            title="Task Lookup"
            description="Browse platform-wide task stats and look up any user's tasks."
            icon={<HiClipboardDocumentList className="h-6 w-6" />}
            iconBg="bg-blue-500"
            onClick={() => navigate('/admin/tasks')}
          />

          <QuickActionCard
            title="Platform Stats"
            description="Detailed breakdown of tasks, health, exercise, and engagement."
            icon={<HiChartBar className="h-6 w-6" />}
            iconBg="bg-purple-500"
            onClick={() => navigate('/admin/tasks')}
          />

        </div>
      </section>

      {/* ── Last refreshed timestamp ── */}
      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <HiClock className="h-3.5 w-3.5" />
        Data loaded at {new Date().toLocaleTimeString()}
      </p>

    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide text-xs">
    {children}
  </h2>
);

const OverviewCard = ({ label, value, icon, color }) => (
  <div className={`flex items-start gap-3 rounded-xl p-4 ${color}`}>
    <div className="mt-0.5 opacity-60">{icon}</div>
    <div>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ActivityCard = ({ title, icon, iconBg, rows }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
    {/* Card header */}
    <div className="mb-4 flex items-center gap-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {/* Stat rows */}
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{row.label}</span>
          <span
            className={`text-sm font-semibold ${
              row.highlight ? 'text-primary' : 'text-gray-900'
            }`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon, iconBg, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
  >
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-0.5 text-sm text-gray-500">{description}</p>
    </div>
    <HiArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
  </button>
);

export default AdminDashboardPage;
