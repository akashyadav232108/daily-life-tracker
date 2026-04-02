import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodayHealthLog, fetchWeeklySummary } from '../../health/healthAPI';
import { HiHeart, HiArrowRight } from 'react-icons/hi2';

const moodEmoji = { GREAT: '😄', GOOD: '🙂', OKAY: '😐', BAD: '😕', TERRIBLE: '😞' };

const TodayHealthSummary = () => {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch both independently — don't let one failure block the other
        const [todayRes, weeklyRes] = await Promise.allSettled([
          fetchTodayHealthLog(),
          fetchWeeklySummary(),
        ]);

        if (todayRes.status === 'fulfilled') {
          setToday(todayRes.value?.data || null);
        }
        if (weeklyRes.status === 'fulfilled') {
          setWeekly(weeklyRes.value?.data || null);
        }
      } catch {
        // silent fail — widgets simply show "no data"
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiHeart className="h-5 w-5 text-rose-500" />
          <h2 className="font-semibold text-gray-900">Today's Health</h2>
        </div>
        <button
          onClick={() => navigate('/health')}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
        >
          View all <HiArrowRight className="h-3 w-3" />
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-gray-400">Loading…</div>
      ) : !today ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center">
          <HiHeart className="mx-auto h-7 w-7 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No health log for today yet.</p>
          <button
            onClick={() => navigate('/health')}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Log today's health →
          </button>
        </div>
      ) : (
        <>
          {/* Mood badge */}
          {today.mood && (
            <div className="mb-3">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600">
                {moodEmoji[today.mood]} {today.mood}
              </span>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatPill icon="💧" label="Water" value={today.waterGlasses != null ? `${today.waterGlasses} gl` : '—'} />
            <StatPill icon="🌙" label="Sleep" value={today.sleepHours != null ? `${today.sleepHours} hrs` : '—'} />
            <StatPill icon="👟" label="Steps" value={today.steps != null ? Number(today.steps).toLocaleString() : '—'} />
            <StatPill icon="⚖️" label="Weight" value={today.weightKg != null ? `${today.weightKg} kg` : '—'} />
          </div>
        </>
      )}

      {/* Weekly averages footer */}
      {weekly && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">7-day averages</p>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>💧 {weekly.avgWaterGlasses ?? '—'} gl</span>
            <span>🌙 {weekly.avgSleepHours ?? '—'} hrs</span>
            <span>👟 {weekly.avgSteps != null ? Number(weekly.avgSteps).toLocaleString() : '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div className="rounded-lg bg-gray-50 px-3 py-2">
    <p className="text-xs text-gray-400">{icon} {label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-700">{value}</p>
  </div>
);

export default TodayHealthSummary;
