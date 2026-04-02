import { useEffect, useState } from 'react';
import { fetchTodayPlanned } from '../../exercises/exerciseAPI';

const TodayWorkout = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTodayPlanned();
        setData(res.data);
      } catch {
        setData(null);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-1 text-lg font-semibold">Today — Workout</h2>
      {!data ? (
        <div className="text-gray-400">No active plan.</div>
      ) : data.isRestDay ? (
        <div className="text-primary">Rest Day</div>
      ) : (
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
          {data.exercises?.map((ex, idx) => (
            <li key={idx}>{ex.exerciseName} {ex.sets ? `- ${ex.sets} x ${ex.reps}` : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodayWorkout;

