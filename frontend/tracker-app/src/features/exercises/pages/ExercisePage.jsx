import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans, fetchActivePlan, fetchTodayPlanned, fetchExerciseLogs, selectPlans, selectActivePlan, selectTodayPlanned, selectExerciseLogs } from '../exerciseSlice';
import PlanBuilder from '../components/PlanBuilder';
import TodayWorkoutCard from '../components/TodayWorkoutCard';
import ExerciseLogForm from '../components/ExerciseLogForm';
import ExerciseLogList from '../components/ExerciseLogList';

const ExercisePage = () => {
  const dispatch = useDispatch();
  const plans = useSelector(selectPlans);
  const activePlan = useSelector(selectActivePlan);
  const today = useSelector(selectTodayPlanned);
  const logs = useSelector(selectExerciseLogs);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchActivePlan());
    dispatch(fetchTodayPlanned());
    dispatch(fetchExerciseLogs({ view: 'week' }));
  }, [dispatch]);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Exercise</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">Log Exercise</h2>
            <ExerciseLogForm />
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">Recent Exercise Logs</h2>
            <ExerciseLogList logs={logs} />
          </div>
        </div>
        <div className="space-y-6">
          <TodayWorkoutCard data={today} />
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">Plan Builder</h2>
            <PlanBuilder plans={plans} activePlan={activePlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;

