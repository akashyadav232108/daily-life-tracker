import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodayHealthLog, fetchWeeklySummary } from '../../health/healthAPI';
import {
  HiHeart,
  HiArrowRight,
  HiBeaker,
  HiMoon,
  HiArrowTrendingUp,
  HiScale,
} from 'react-icons/hi2';

const moodEmoji = { GREAT: '😄', GOOD: '🙂', OKAY: '😐', BAD: '😕', TERRIBLE: '😞' };
const moodColor = {
  GREAT: 'bg-green-50 text-green-700 border-green-200',
  GOOD:  'bg-blue-50 text-blue-700 border-blue-200',
  OKAY:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  BAD:   'bg-orange-50 text-orange-700 border-orange-200',
  TERRIBLE: 'bg-red-50 text-red-700 border-red-200',
};

const TodayHealthSummary = () => {
  const [today, setToday]   = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── All data-fetching logic unchanged ──
  useEffect(() => {
    const load = async () => {
      try {
        const [todayRes, weeklyRes] = await Promise.allSettled([
          fetchTodayHealthLog(),
          fetchWeeklySummary(),
        ]);
        if (todayRes.status  === 'fulfilled') setToday(todayRes.value?.data || null);
        if (weeklyRes.status === 'fulfilled') setWeekly(weeklyRes.value?.data || null);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
            <HiHeart className="h-4 w-4 text-rose-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Today's Health</h2>
        </div>
        <button
          onClick={() => navigate('/health')}
          className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all
          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
        ) : !today ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <HiHeart className="h-6 w-6 text-rose-300" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">No health log yet today</p>
            <button
              onClick={() => navigate('/health')}
              className="mt-3 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
            >
              Log today's health →
            </button>
          </div>
        ) : (
          <>
            {/* Mood badge */}
            {today.mood && (
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${moodColor[today.mood] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {moodEmoji[today.mood]} {today.mood.charAt(0) + today.mood.slice(1).toLowerCase()}
                </span>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <HealthStat icon={HiBeaker}          label="Water"   value={today.waterGlasses  != null ? `${today.waterGlasses} gl`  : '—'} color="bg-blue-50 text-blue-700" />
              <HealthStat icon={HiMoon}            label="Sleep"   value={today.sleepHours    != null ? `${today.sleepHours} hrs`   : '—'} color="bg-indigo-50 text-indigo-700" />
              <HealthStat icon={HiArrowTrendingUp} label="Steps"   value={today.steps         != null ? Number(today.steps).toLocaleString() : '—'} color="bg-green-50 text-green-700" />
              <HealthStat icon={HiScale}           label="Weight"  value={today.weightKg      != null ? `${today.weightKg} kg`      : '—'} color="bg-amber-50 text-amber-700" />
            </div>
          </>
        )}

        {/* Weekly averages footer */}
        {weekly && (
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">7-day averages</p>
            <div className="flex gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1"><HiBeaker className="h-3 w-3 text-blue-400" /> {weekly.avgWaterGlasses ?? '—'} gl</span>
              <span className="flex items-center gap-1"><HiMoon className="h-3 w-3 text-indigo-400" /> {weekly.avgSleepHours ?? '—'} hrs</span>
              <span className="flex items-center gap-1"><HiArrowTrendingUp className="h-3 w-3 text-green-400" /> {weekly.avgSteps != null ? Number(weekly.avgSteps).toLocaleString() : '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HealthStat = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 rounded-xl p-3 ${color}`}>
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-0.5 text-base font-bold">{value}</p>
    </div>
  </div>
);

export default TodayHealthSummary;
