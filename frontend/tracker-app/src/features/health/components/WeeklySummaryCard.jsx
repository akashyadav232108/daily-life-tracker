import { HiCalendarDays } from 'react-icons/hi2';

const moodEmoji = {
  GREAT: '😄',
  GOOD: '🙂',
  OKAY: '😐',
  BAD: '😕',
  TERRIBLE: '😞',
};

const WeeklySummaryCard = ({ summary }) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="mb-3 flex items-center gap-2">
        <HiCalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
      </div>

      {!summary ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
          <HiCalendarDays className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No data yet.</p>
          <p className="mt-1 text-xs text-gray-400">Log your health daily to see trends.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-gray-400">
            {summary.weekStart} — {summary.weekEnd}
          </p>

          {/* Averages */}
          <div className="space-y-3">
            <SummaryRow icon="💧" label="Avg Water" value={summary.avgWaterGlasses != null ? `${summary.avgWaterGlasses} glasses` : '—'} />
            <SummaryRow icon="🌙" label="Avg Sleep" value={summary.avgSleepHours != null ? `${summary.avgSleepHours} hrs` : '—'} />
            <SummaryRow icon="👟" label="Avg Steps" value={summary.avgSteps != null ? Number(summary.avgSteps).toLocaleString() : '—'} />
            <SummaryRow icon="📅" label="Days Logged" value={`${summary.daysLogged ?? 0} / 7`} highlight />
          </div>

          {/* Mood distribution */}
          {summary.moodDistribution && Object.keys(summary.moodDistribution).length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Mood breakdown</p>
              <div className="space-y-1.5">
                {Object.entries(summary.moodDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {moodEmoji[mood] || ''} {mood}
                      </span>
                      <span className="font-medium text-gray-800">{count}×</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SummaryRow = ({ icon, label, value, highlight }) => (
  <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${highlight ? 'bg-primary/5' : 'bg-gray-50'}`}>
    <span className="text-sm text-gray-600">
      {icon} {label}
    </span>
    <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

export default WeeklySummaryCard;
