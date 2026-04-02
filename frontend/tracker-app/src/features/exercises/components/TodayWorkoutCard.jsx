import { HiBolt, HiMoon } from 'react-icons/hi2';

const muscleColor = {
  CHEST: 'bg-red-50 text-red-700',
  BACK: 'bg-blue-50 text-blue-700',
  LEGS: 'bg-green-50 text-green-700',
  SHOULDERS: 'bg-yellow-50 text-yellow-700',
  ARMS: 'bg-orange-50 text-orange-700',
  CORE: 'bg-purple-50 text-purple-700',
  FULL_BODY: 'bg-indigo-50 text-indigo-700',
  CARDIO: 'bg-pink-50 text-pink-700',
  REST: 'bg-gray-100 text-gray-500',
};

const TodayWorkoutCard = ({ data }) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="mb-3 flex items-center gap-2">
        <HiBolt className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Today's Workout</h2>
      </div>

      {!data ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center">
          <HiBolt className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No active plan for today.</p>
          <p className="mt-1 text-xs text-gray-400">Create a plan below to get started.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm font-medium text-gray-500">{data.planName}</p>

          {data.isRestDay ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <HiMoon className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-700">Rest Day</p>
                <p className="text-sm text-gray-400">Recovery is part of the plan 💤</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${muscleColor[data.muscleGroup] || 'bg-gray-100 text-gray-600'}`}>
                  {data.muscleGroup?.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">{data.dayOfWeek}</span>
              </div>

              {data.exercises && data.exercises.length > 0 ? (
                <ul className="space-y-2">
                  {data.exercises.map((ex, idx) => (
                    <li key={idx} className="flex items-start justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-800">{ex.exerciseName}</span>
                      <span className="ml-2 shrink-0 text-gray-500">
                        {ex.numSets && ex.numReps
                          ? `${ex.numSets} × ${ex.numReps}`
                          : ex.durationMinutes
                          ? `${ex.durationMinutes} min`
                          : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No exercises added for this day.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TodayWorkoutCard;
