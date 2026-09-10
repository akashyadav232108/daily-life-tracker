import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiFire } from 'react-icons/hi2';
import {
  fetchStreaks,
  selectStreaks,
  selectNotifLoading,
} from '../notificationSlice';

const STREAK_META = {
  HEALTH_LOG:    { icon: '❤️', label: 'Health Log',   bar: 'from-pink-400 to-rose-500'    },
  TASK_COMPLETE: { icon: '✅', label: 'Task Streak',  bar: 'from-blue-400 to-indigo-500'  },
  EXERCISE:      { icon: '🔥', label: 'Exercise',     bar: 'from-orange-400 to-amber-500' },
};

const StreakWidget = () => {
  const dispatch = useDispatch();
  const streaks  = useSelector(selectStreaks);
  const loading  = useSelector(selectNotifLoading);

  // ── All data-fetching logic unchanged ──
  useEffect(() => {
    dispatch(fetchStreaks());
  }, [dispatch]);

  if (loading) return null;

  if (!streaks || streaks.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <HiFire className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Your Streaks</h3>
        </div>
        <p className="text-sm text-gray-400">Start logging daily to build your streaks!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
          <HiFire className="h-4 w-4 text-orange-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Your Streaks 🔥</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {streaks.map((s) => {
          const meta = STREAK_META[s.streakType] || {
            icon: '⚡',
            label: s.streakType,
            bar: 'from-gray-400 to-gray-500',
          };
          const pct = s.longestStreak > 0
            ? Math.round((s.currentStreak / s.longestStreak) * 100)
            : 100;

          return (
            <div
              key={s.streakType}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 ring-1 ring-gray-200"
            >
              {/* Icon + label */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  <span className="text-xs font-semibold text-gray-600">{meta.label}</span>
                </div>
                {s.currentStreak > 0 && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-200">
                    Best: {s.longestStreak}d
                  </span>
                )}
              </div>

              {/* Number */}
              <div className="mb-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900 leading-none">{s.currentStreak}</span>
                <span className="mb-0.5 text-sm text-gray-400">days</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${meta.bar}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] text-gray-400">
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
