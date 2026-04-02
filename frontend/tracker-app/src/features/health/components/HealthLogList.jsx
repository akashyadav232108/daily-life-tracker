const HealthLogList = ({ logs, loading }) => {
  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!logs || logs.length === 0) return <div className="text-gray-400">No logs yet.</div>;
  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <div key={l.id || l.logDate} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{l.logDate}</div>
            <div className="text-sm text-gray-500">{l.mood || '-'}</div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-sm text-gray-600">
            <div>Water: {l.waterGlasses ?? '-'}</div>
            <div>Sleep: {l.sleepHours ?? '-'}</div>
            <div>Steps: {l.steps ?? '-'}</div>
            <div>Weight: {l.weightKg ?? '-'}</div>
          </div>
          {l.notes && <div className="mt-2 text-sm text-gray-600">Notes: {l.notes}</div>}
        </div>
      ))}
    </div>
  );
};

export default HealthLogList;

