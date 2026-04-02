import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHealthLogs,
  fetchWeeklySummary,
  selectHealthLogs,
  selectWeeklySummary,
  selectHealthLoading,
  selectHealthError,
  clearHealthError,
} from '../healthSlice';
import HealthLogForm from '../components/HealthLogForm';
import HealthLogList from '../components/HealthLogList';
import WeeklySummaryCard from '../components/WeeklySummaryCard';
import { HiHeart, HiBeaker, HiMoon, HiArrowTrendingUp } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const HealthPage = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectHealthLogs);
  const weekly = useSelector(selectWeeklySummary);
  const loading = useSelector(selectHealthLoading);
  const error = useSelector(selectHealthError);

  useEffect(() => {
    dispatch(fetchHealthLogs({ view: 'week' }));
    dispatch(fetchWeeklySummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearHealthError());
    }
  }, [error, dispatch]);

  // Derive quick stats from weekly summary
  const stats = [
    {
      label: 'Avg Water',
      value: weekly?.avgWaterGlasses != null ? `${weekly.avgWaterGlasses} gl` : '—',
      icon: HiBeaker,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Avg Sleep',
      value: weekly?.avgSleepHours != null ? `${weekly.avgSleepHours} hrs` : '—',
      icon: HiMoon,
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Avg Steps',
      value: weekly?.avgSteps != null ? Number(weekly.avgSteps).toLocaleString() : '—',
      icon: HiArrowTrendingUp,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Days Logged',
      value: weekly?.daysLogged != null ? `${weekly.daysLogged} / 7` : '—',
      icon: HiHeart,
      color: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Log your daily health metrics and track weekly trends.
        </p>
      </div>

      {/* ── Weekly Stats Bar ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl p-4 ${s.color}`}>
            <s.icon className="h-6 w-6 shrink-0 opacity-75" />
            <div>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — Form + Logs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Log today */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <HiHeart className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-gray-900">Log Today's Health</h2>
            </div>
            <HealthLogForm />
          </div>

          {/* Recent logs */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <HiArrowTrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">This Week's Logs</h2>
            </div>
            <HealthLogList logs={logs} loading={loading} />
          </div>
        </div>

        {/* Right column — Weekly summary */}
        <div>
          <WeeklySummaryCard summary={weekly} />
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
