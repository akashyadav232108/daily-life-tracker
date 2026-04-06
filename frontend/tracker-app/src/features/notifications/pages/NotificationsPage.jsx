import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiBell,
  HiCheckCircle,
  HiTrash,
  HiInboxStack,
  HiArrowPath,
  HiFire,
  HiCalendarDays,
  HiChartBar,
} from 'react-icons/hi2';
import {
  fetchNotifications,
  fetchStreaks,
  fetchWeeklySummary,
  markAsRead,
  markAllRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectTotalPages,
  selectCurrentPage,
  selectStreaks,
  selectWeeklySummary,
  selectNotifLoading,
} from '../notificationSlice';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────

const TYPE_COLORS = {
  TASK_REMINDER:    'bg-blue-100 text-blue-700 border-blue-200',
  BUDGET_ALERT:     'bg-red-100 text-red-700 border-red-200',
  HEALTH_STREAK:    'bg-pink-100 text-pink-700 border-pink-200',
  EXERCISE_STREAK:  'bg-orange-100 text-orange-700 border-orange-200',
  EXERCISE_REMINDER:'bg-yellow-100 text-yellow-700 border-yellow-200',
  DAILY_SUMMARY:    'bg-green-100 text-green-700 border-green-200',
};

const TYPE_ICONS = {
  TASK_REMINDER:    '📋',
  BUDGET_ALERT:     '💰',
  HEALTH_STREAK:    '❤️',
  EXERCISE_STREAK:  '🔥',
  EXERCISE_REMINDER:'🏋️',
  DAILY_SUMMARY:    '📊',
};

const STREAK_ICONS = {
  HEALTH_LOG:    { icon: '❤️', label: 'Health Log', color: 'text-pink-600 bg-pink-50 border-pink-200' },
  TASK_COMPLETE: { icon: '✅', label: 'Task Streak', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  EXERCISE:      { icon: '🔥', label: 'Exercise',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ── Sub-components ───────────────────────────────────────────────

const StreakCard = ({ streak }) => {
  const meta = STREAK_ICONS[streak.streakType] || { icon: '⚡', label: streak.streakType, color: 'text-gray-600 bg-gray-50 border-gray-200' };
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${meta.color}`}>
      <span className="text-2xl">{meta.icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{meta.label}</p>
        <p className="text-xl font-bold">{streak.currentStreak} <span className="text-sm font-normal">days</span></p>
        <p className="text-xs opacity-60">Best: {streak.longestStreak} days</p>
      </div>
    </div>
  );
};

const WeeklySummaryCard = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <HiChartBar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Tasks Done" value={summary.tasksCompleted ?? '—'} color="text-blue-600" />
        <Stat label="Health Days" value={summary.healthDaysLogged ?? '—'} color="text-pink-600" />
        <Stat label="Exercise Days" value={summary.exerciseDaysLogged ?? '—'} color="text-orange-600" />
        <Stat label="Spent" value={summary.totalExpenses != null ? `₹${summary.totalExpenses}` : '—'} color="text-green-600" />
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className="text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('all'); // 'all' | 'unread'

  const notifications = useSelector(selectNotifications);
  const unreadCount   = useSelector(selectUnreadCount);
  const totalPages    = useSelector(selectTotalPages);
  const currentPage   = useSelector(selectCurrentPage);
  const streaks       = useSelector(selectStreaks);
  const weekly        = useSelector(selectWeeklySummary);
  const loading       = useSelector(selectNotifLoading);

  const loadPage = (page = 0) => {
    dispatch(fetchNotifications({
      page,
      size: 15,
      unreadOnly: tab === 'unread',
    }));
  };

  useEffect(() => {
    loadPage(0);
    dispatch(fetchStreaks());
    dispatch(fetchWeeklySummary());
  }, [tab]); // eslint-disable-line

  const handleMarkRead = async (id) => {
    await dispatch(markAsRead(id));
  };

  const handleDelete = async (id) => {
    await dispatch(deleteNotification(id));
    toast.success('Notification deleted');
  };

  const handleMarkAll = async () => {
    await dispatch(markAllRead());
    toast.success('All notifications marked as read');
  };

  const displayed = tab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiBell className="h-7 w-7 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your activity feed and insights</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <HiCheckCircle className="h-4 w-4" />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* ── Streaks row ── */}
      {streaks.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <HiFire className="h-4 w-4 text-orange-500" />
            Your Streaks
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {streaks.map((s) => (
              <StreakCard key={s.streakType} streak={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── Weekly summary ── */}
      {weekly && <WeeklySummaryCard summary={weekly} />}

      {/* ── Notifications list ── */}
      <section>
        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 border-b border-gray-200">
          {['all', 'unread'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'unread' && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              {t === 'all' ? 'All' : 'Unread'}
            </button>
          ))}

          <div className="ml-auto">
            <button
              onClick={() => loadPage(0)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              <HiArrowPath className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* List */}
        {loading && (
          <div className="py-10 text-center text-gray-400">Loading notifications…</div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <HiInboxStack className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-gray-400">
              Notifications from your tasks, health logs, and expenses will appear here.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {!loading &&
            displayed.map((n) => (
              <div
                key={n.id}
                className={`group flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  !n.read
                    ? 'border-primary/20 bg-blue-50/40'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {/* Type badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span className="text-xl">{TYPE_ICONS[n.notificationType] || '🔔'}</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        TYPE_COLORS[n.notificationType] || 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {n.notificationType?.replace(/_/g, ' ')}
                    </span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <HiCalendarDays className="h-3 w-3" />
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as read"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                    >
                      <HiCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    title="Delete"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => loadPage(currentPage - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => loadPage(currentPage + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
