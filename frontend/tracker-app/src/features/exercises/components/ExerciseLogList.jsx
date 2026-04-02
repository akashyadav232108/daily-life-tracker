import { HiBolt } from 'react-icons/hi2';

const muscleColor = {
  CHEST: 'bg-red-100 text-red-700',
  BACK: 'bg-blue-100 text-blue-700',
  LEGS: 'bg-green-100 text-green-700',
  SHOULDERS: 'bg-yellow-100 text-yellow-700',
  ARMS: 'bg-orange-100 text-orange-700',
  CORE: 'bg-purple-100 text-purple-700',
  FULL_BODY: 'bg-indigo-100 text-indigo-700',
  CARDIO: 'bg-pink-100 text-pink-700',
  REST: 'bg-gray-100 text-gray-500',
};

const muscleEmoji = {
  CHEST: '💪', BACK: '🔙', LEGS: '🦵', SHOULDERS: '🏋️',
  ARMS: '💪', CORE: '🔥', FULL_BODY: '⚡', CARDIO: '🏃', REST: '😴',
};

const ExerciseLogList = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
        <HiBolt className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">No workouts logged this week</p>
        <p className="mt-1 text-xs text-gray-400">Log your first exercise above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <div
          key={l.id}
          className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{l.exerciseName}</span>
            <div className="flex items-center gap-2">
              {l.muscleGroup && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${muscleColor[l.muscleGroup] || 'bg-gray-100 text-gray-600'}`}>
                  {muscleEmoji[l.muscleGroup]} {l.muscleGroup.replace('_', ' ')}
                </span>
              )}
              <span className="text-xs text-gray-400">{l.logDate}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-2">
            {l.setsCompleted != null && (
              <StatChip label="Sets" value={l.setsCompleted} />
            )}
            {l.repsCompleted != null && (
              <StatChip label="Reps" value={l.repsCompleted} />
            )}
            {l.weightKg != null && (
              <StatChip label="Weight" value={`${l.weightKg} kg`} />
            )}
            {l.durationMinutes != null && (
              <StatChip label="Duration" value={`${l.durationMinutes} min`} />
            )}
          </div>

          {l.notes && (
            <p className="mt-2 text-xs text-gray-500 italic">"{l.notes}"</p>
          )}
        </div>
      ))}
    </div>
  );
};

const StatChip = ({ label, value }) => (
  <span className="rounded-lg bg-white px-3 py-1 text-xs shadow-sm">
    <span className="text-gray-400">{label}: </span>
    <span className="font-semibold text-gray-700">{value}</span>
  </span>
);

export default ExerciseLogList;
