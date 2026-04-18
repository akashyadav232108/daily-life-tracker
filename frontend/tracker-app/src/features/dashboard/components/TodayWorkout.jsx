import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodayPlanned } from '../../exercises/exerciseAPI';
import { HiBolt, HiMoon, HiArrowRight } from 'react-icons/hi2';

const muscleColor = {
  CHEST:     'bg-red-100 text-red-700',
  BACK:      'bg-blue-100 text-blue-700',
  LEGS:      'bg-green-100 text-green-700',
  SHOULDERS: 'bg-yellow-100 text-yellow-700',
  ARMS:      'bg-orange-100 text-orange-700',
  CORE:      'bg-purple-100 text-purple-700',
  FULL_BODY: 'bg-indigo-100 text-indigo-700',
  CARDIO:    'bg-pink-100 text-pink-700',
};

const TodayWorkout = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── All data-fetching logic unchanged ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTodayPlanned();
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
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <HiBolt className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Today's Workout</h2>
        </div>
        <button
          onClick={() => navigate('/exercise')}
          className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View all
          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
        ) : !data ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
              <HiBolt className="h-6 w-6 text-orange-300" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">No active workout plan</p>
            <button
              onClick={() => navigate('/exercise')}
              className="mt-3 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors"
            >
              Create a plan →
            </button>
          </div>
        ) : data.isRestDay ? (
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <HiMoon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Rest Day 💤</p>
              <p className="mt-0.5 text-xs text-gray-400">{data.planName}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-xs font-medium text-gray-500">{data.planName}</p>
              {data.muscleGroup && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${muscleColor[data.muscleGroup] || 'bg-gray-100 text-gray-600'}`}>
                  {data.muscleGroup.replace('_', ' ')}
                </span>
              )}
            </div>

            {data.exercises && data.exercises.length > 0 ? (
              <ul className="space-y-2">
                {data.exercises.slice(0, 5).map((ex, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm transition-colors hover:bg-orange-50/40"
                  >
                    <span className="font-medium text-gray-800">{ex.exerciseName}</span>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-gray-500 shadow-sm">
                      {ex.numSets && ex.numReps
                        ? `${ex.numSets} × ${ex.numReps}`
                        : ex.durationMinutes
                        ? `${ex.durationMinutes} min`
                        : ''}
                    </span>
                  </li>
                ))}
                {data.exercises.length > 5 && (
                  <p className="pt-1 text-center text-xs text-gray-400">
                    +{data.exercises.length - 5} more exercises
                  </p>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No exercises for today's plan day.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TodayWorkout;
