import LoadingSpinner from '../../../components/LoadingSpinner';
import { HiHeart } from 'react-icons/hi2';

const moodEmoji = {
  GREAT: '😄',
  GOOD: '🙂',
  OKAY: '😐',
  BAD: '😕',
  TERRIBLE: '😞',
};

const moodBadge = {
  GREAT: 'bg-green-100 text-green-700',
  GOOD: 'bg-blue-100 text-blue-700',
  OKAY: 'bg-yellow-100 text-yellow-700',
  BAD: 'bg-orange-100 text-orange-700',
  TERRIBLE: 'bg-red-100 text-red-700',
};

const HealthLogList = ({ logs, loading }) => {
  if (loading) return <LoadingSpinner size="md" className="py-8" />;

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
        <HiHeart className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">No logs this week</p>
        <p className="mt-1 text-xs text-gray-400">Start logging your daily health above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <div
          key={l.id || l.logDate}
          className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{l.logDate}</span>
            {l.mood ? (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${moodBadge[l.mood] || 'bg-gray-100 text-gray-600'}`}>
                {moodEmoji[l.mood]} {l.mood}
              </span>
            ) : null}
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill icon="💧" label="Water" value={l.waterGlasses != null ? `${l.waterGlasses} gl` : '—'} />
            <StatPill icon="🌙" label="Sleep" value={l.sleepHours != null ? `${l.sleepHours} hrs` : '—'} />
            <StatPill icon="👟" label="Steps" value={l.steps != null ? Number(l.steps).toLocaleString() : '—'} />
            <StatPill icon="⚖️" label="Weight" value={l.weightKg != null ? `${l.weightKg} kg` : '—'} />
          </div>

          {/* Notes */}
          {l.notes && (
            <p className="mt-2 text-xs text-gray-500 italic">"{l.notes}"</p>
          )}
        </div>
      ))}
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
    <p className="text-xs text-gray-400">{icon} {label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-700">{value}</p>
  </div>
);

export default HealthLogList;
