import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodayPlanned } from '../../exercises/exerciseAPI';
import { HiBolt, HiMoon, HiArrowRight } from 'react-icons/hi2';

const muscleColor = {
  CHEST: 'bg-red-100 text-red-700',
  BACK: 'bg-blue-100 text-blue-700',
  LEGS: 'bg-green-100 text-green-700',
  SHOULDERS: 'bg-yellow-100 text-yellow-700',
  ARMS: 'bg-orange-100 text-orange-700',
  CORE: 'bg-purple-100 text-purple-700',
  FULL_BODY: 'bg-indigo-100 text-indigo-700',
  CARDIO: 'bg-pink-100 text-pink-700',
};

const TodayWorkout = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTodayPlanned();
        // res = { success, message, data: ExercisePlanDayResponse }
        setData(res.data || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiBolt className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Today's Workout</h2>
        </div>
        <button
          onClick={() => navigate('/exercise')}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
        >
          View all <HiArrowRight className="h-3 w-3" />
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-gray-400">Loading…</div>
      ) : !data ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center">
          <HiBolt className="mx-auto h-7 w-7 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No active workout plan.</p>
          <button
            onClick={() => navigate('/exercise')}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Create a plan →
          </button>
        </div>
      ) : data.isRestDay ? (
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
          <HiMoon className="h-7 w-7 text-gray-400" />
          <div>
            <p className="font-semibold text-gray-700">Rest Day 💤</p>
            <p className="text-xs text-gray-400">{data.planName}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-xs text-gray-500">{data.planName}</p>
            {data.muscleGroup && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${muscleColor[data.muscleGroup] || 'bg-gray-100 text-gray-600'}`}>
                {data.muscleGroup.replace('_', ' ')}
              </span>
            )}
          </div>

          {data.exercises && data.exercises.length > 0 ? (
            <ul className="space-y-1.5">
              {data.exercises.slice(0, 5).map((ex, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">{ex.exerciseName}</span>
                  <span className="text-xs text-gray-500">
                    {ex.numSets && ex.numReps
                      ? `${ex.numSets} × ${ex.numReps}`
                      : ex.durationMinutes
                      ? `${ex.durationMinutes} min`
                      : ''}
                  </span>
                </li>
              ))}
              {data.exercises.length > 5 && (
                <p className="text-center text-xs text-gray-400">+{data.exercises.length - 5} more</p>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No exercises for today's plan day.</p>
          )}
        </>
      )}
    </div>
  );
};

export default TodayWorkout;
