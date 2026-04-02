import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPlans,
  fetchActivePlan,
  fetchTodayPlanned,
  fetchExerciseLogs,
  selectPlans,
  selectActivePlan,
  selectTodayPlanned,
  selectExerciseLogs,
  selectExerciseError,
  clearExerciseError,
} from '../exerciseSlice';
import PlanBuilder from '../components/PlanBuilder';
import TodayWorkoutCard from '../components/TodayWorkoutCard';
import ExerciseLogForm from '../components/ExerciseLogForm';
import ExerciseLogList from '../components/ExerciseLogList';
import { HiBolt, HiClipboardDocumentList, HiCalendarDays } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ExercisePage = () => {
  const dispatch = useDispatch();
  const plans = useSelector(selectPlans);
  const activePlan = useSelector(selectActivePlan);
  const today = useSelector(selectTodayPlanned);
  const logs = useSelector(selectExerciseLogs);
  const error = useSelector(selectExerciseError);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchActivePlan());
    dispatch(fetchTodayPlanned());
    dispatch(fetchExerciseLogs({ view: 'week' }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExerciseError());
    }
  }, [error, dispatch]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exercise Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Log your workouts, track your progress, and manage weekly plans.
        </p>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — Log + History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Log exercise */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <HiBolt className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Log an Exercise</h2>
            </div>
            <ExerciseLogForm />
          </div>

          {/* Recent logs */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <HiClipboardDocumentList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">This Week's Workouts</h2>
            </div>
            <ExerciseLogList logs={logs} />
          </div>
        </div>

        {/* Right column — Today + Plan Builder */}
        <div className="space-y-6">
          <TodayWorkoutCard data={today} />

          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-4 flex items-center gap-2">
              <HiCalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Plan Builder</h2>
            </div>
            <PlanBuilder plans={plans} activePlan={activePlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;
