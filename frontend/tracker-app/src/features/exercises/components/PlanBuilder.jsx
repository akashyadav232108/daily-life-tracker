import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPlan, updatePlan, activatePlan, fetchPlans, fetchActivePlan, fetchTodayPlanned } from '../exerciseSlice';

const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const muscles = ['CHEST','BACK','LEGS','SHOULDERS','ARMS','CORE','FULL_BODY','CARDIO','REST'];

const PlanBuilder = ({ plans, activePlan }) => {
  const dispatch = useDispatch();
  const [planName, setPlanName] = useState('');
  const [grid, setGrid] = useState(() => days.map(d => ({
    dayOfWeek: d,
    muscleGroup: 'REST',
    notes: '',
    exercises: [],
  })));

  const onSetMuscle = (idx, val) => {
    setGrid(g => g.map((row, i) => i === idx ? { ...row, muscleGroup: val, exercises: val === 'REST' ? [] : row.exercises } : row));
  };

  const onAddExercise = (idx) => {
    setGrid(g => g.map((row, i) => i === idx ? { ...row, exercises: [...row.exercises, { exerciseName: '', sets: 3, reps: 10, orderIndex: row.exercises.length + 1 }] } : row));
  };

  const onExerciseChange = (dayIdx, exIdx, field, value) => {
    setGrid(g => g.map((row, i) => {
      if (i !== dayIdx) return row;
      const exs = row.exercises.map((ex, j) => j === exIdx ? { ...ex, [field]: field === 'exerciseName' ? value : Number(value) } : ex);
      return { ...row, exercises: exs };
    }));
  };

  const payload = useMemo(() => ({
    planName: planName || 'My Plan',
    days: grid.map(r => ({
      ...r,
      exercises: r.muscleGroup === 'REST' ? [] : r.exercises
    })),
  }), [planName, grid]);

  const onCreate = async () => {
    await dispatch(createPlan(payload));
    await dispatch(fetchPlans());
    await dispatch(fetchActivePlan());
  };

  const onActivate = async (id) => {
    await dispatch(activatePlan(id));
    await dispatch(fetchPlans());
    await dispatch(fetchActivePlan());
    await dispatch(fetchTodayPlanned());
  };

  return (
    <div>
      <div className="mb-4">
        <input className="input w-full" placeholder="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
      </div>
      <div className="space-y-3">
        {grid.map((row, idx) => (
          <div key={row.dayOfWeek} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{row.dayOfWeek}</div>
              <select className="input" value={row.muscleGroup} onChange={(e) => onSetMuscle(idx, e.target.value)}>
                {muscles.map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
              </select>
            </div>
            {row.muscleGroup !== 'REST' && (
              <div className="mt-3">
                <button type="button" className="btn btn-secondary" onClick={() => onAddExercise(idx)}>Add Exercise</button>
                <div className="mt-2 space-y-2">
                  {row.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="grid grid-cols-4 gap-2">
                      <input className="input col-span-2" placeholder="Exercise" value={ex.exerciseName} onChange={(e) => onExerciseChange(idx, exIdx, 'exerciseName', e.target.value)} />
                      <input className="input" type="number" placeholder="Sets" value={ex.sets} onChange={(e) => onExerciseChange(idx, exIdx, 'sets', e.target.value)} />
                      <input className="input" type="number" placeholder="Reps" value={ex.reps} onChange={(e) => onExerciseChange(idx, exIdx, 'reps', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" onClick={onCreate}>Save Plan</button>
        {activePlan && <button className="btn btn-secondary" onClick={() => onActivate(activePlan.id)}>Re-Activate Current</button>}
        {plans && plans.length > 0 && plans.filter(p => !p.isActive).slice(0,1).map(p => (
          <button key={p.id} className="btn" onClick={() => onActivate(p.id)}>Activate "{p.planName}"</button>
        ))}
      </div>
    </div>
  );
};

export default PlanBuilder;

