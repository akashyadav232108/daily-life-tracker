const ExerciseLogList = ({ logs }) => {
  if (!logs || logs.length === 0) return <div className="text-gray-400">No exercise logs.</div>;
  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <div key={l.id} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{l.logDate}</div>
            <div className="text-sm text-gray-500">{l.muscleGroup || '-'}</div>
          </div>
          <div className="mt-1 text-sm text-gray-700">{l.exerciseName}</div>
          <div className="mt-1 grid grid-cols-4 gap-2 text-sm text-gray-600">
            <div>Sets: {l.setsCompleted ?? '-'}</div>
            <div>Reps: {l.repsCompleted ?? '-'}</div>
            <div>Weight: {l.weightKg ?? '-'}</div>
            <div>Duration: {l.durationMinutes ?? '-'}</div>
          </div>
          {l.notes && <div className="mt-1 text-sm text-gray-600">Notes: {l.notes}</div>}
        </div>
      ))}
    </div>
  );
};

export default ExerciseLogList;

