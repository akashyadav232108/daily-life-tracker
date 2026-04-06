import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiFire } from 'react-icons/hi2';
import { fetchStreaks, selectStreaks, selectInsightsLoading } from '../notificationSlice';

const STREAK_META = {
  HEALTH_LOG:    { icon: '❤️', label: 'Health Log',     bar: 'bg-pink-400' },
  TASK_COMPLETE: { icon: '✅', label: 'Tasks',           bar: 'bg-blue-400' },
  EXERCISE:      { icon: '🔥', label: 'Exercise',        bar: 'bg-orange-400' },
};

/**
 * Compact streak widget — shown on the Dashboard.
 * Fetches streaks from notification-service and displays each as a mini card.
 */
const StreakWidget = () => {
  const dispatch = useDispatch();
  const streaks  = useSelector(selectStreaks);
  const loading  = useSelector(selectInsightsLoading);

  useEffect(() => {
    dispatch(fetchStreaks());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (streaks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
        <HiFire className="h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No streaks yet</p>
        <p className="text-xs text-gray-400">
          Complete tasks, log health and exercise to build streaks!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <HiFire className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Your Streaks 🔥</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {streaks.map((s) => {
          const meta = STREAK_META[s.streakType] || { icon: '⚡', label: s.streakType, bar: 'bg-gray-400' };
          const pct  = s.longestStreak > 0
            ? Math.round((s.currentStreak / s.longestStreak) * 100)
            : 100;

          return (
            <div key={s.streakType} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{meta.icon}</span>
                <span className="text-xs font-medium text-gray-600">{meta.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">{s.currentStreak}</span>
                <span className="text-xs text-gray-400">/{s.longestStreak} best</span>
              </div>
              {/* Progress bar: current vs longest */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${meta.bar}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400">
                {s.currentStreak === 0
                  ? 'Start today!'
                  : `${s.currentStreak} day${s.currentStreak !== 1 ? 's' : ''} in a row`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakWidget;
