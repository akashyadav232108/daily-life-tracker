const TodayWorkoutCard = ({ data }) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-1 text-lg font-semibold">Today's Plan</h2>
      {!data ? (
        <div className="text-gray-400">No active plan.</div>
      ) : (
        <>
          <div className="text-sm text-gray-500">{data.planName}</div>
          <div className="mt-2 text-sm">
            <div className="flex justify-between">
              <span>Day</span><span>{data.dayOfWeek}</span>
            </div>
            <div className="flex justify-between">
              <span>Muscle</span><span>{data.muscleGroup || '-'}</span>
            </div>
            {data.isRestDay && <div className="mt-2 text-primary">Rest Day</div>}
            {!data.isRestDay && (
              <ul className="mt-2 list-disc pl-5 text-gray-700">
                {data.exercises?.map((ex, idx) => (
                  <li key={idx}>{ex.exerciseName} {ex.sets ? `- ${ex.sets} x ${ex.reps}` : ''}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TodayWorkoutCard;

