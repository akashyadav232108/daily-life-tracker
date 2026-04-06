import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiCheckCircle,
  HiTrash,
  HiArrowRightCircle,
  HiXMark,
} from 'react-icons/hi2';
import {
  fetchUnreadCount,
  fetchNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  selectUnreadCount,
  selectNotifications,
  selectNotifLoading,
} from '../notificationSlice';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────

const TYPE_COLORS = {
  TASK_REMINDER:    'bg-blue-100 text-blue-700',
  BUDGET_ALERT:     'bg-red-100 text-red-700',
  HEALTH_STREAK:    'bg-pink-100 text-pink-700',
  EXERCISE_STREAK:  'bg-orange-100 text-orange-700',
  EXERCISE_REMINDER:'bg-yellow-100 text-yellow-700',
  DAILY_SUMMARY:    'bg-green-100 text-green-700',
};

const TYPE_LABELS = {
  TASK_REMINDER:    '📋 Task',
  BUDGET_ALERT:     '💰 Budget',
  HEALTH_STREAK:    '❤️ Health',
  EXERCISE_STREAK:  '🔥 Exercise',
  EXERCISE_REMINDER:'🏋️ Workout',
  DAILY_SUMMARY:    '📊 Summary',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ── Component ────────────────────────────────────────────────────

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = useSelector(selectUnreadCount);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotifLoading);

  // Poll unread count every 60 s
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Load latest 10 notifications when panel opens
  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 0, size: 10 }));
    }
  }, [open, dispatch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    await dispatch(markAsRead(id));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await dispatch(deleteNotification(id));
  };

  const handleMarkAll = async () => {
    await dispatch(markAllRead());
    toast.success('All notifications marked as read');
  };

  const preview = notifications.slice(0, 8);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <HiBell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {loading && (
              <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
            )}

            {!loading && preview.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                <HiBell className="h-8 w-8 opacity-30" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}

            {!loading &&
              preview.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !n.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        !n.read ? 'bg-primary' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          TYPE_COLORS[n.notificationType] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {TYPE_LABELS[n.notificationType] || n.notificationType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkRead(e, n.id)}
                        title="Mark as read"
                        className="rounded p-0.5 text-gray-400 hover:text-green-600"
                      >
                        <HiCheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      title="Delete"
                      className="rounded p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all notifications
              <HiArrowRightCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
