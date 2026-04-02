import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logExercise, fetchExerciseLogs, fetchTodayPlanned } from '../../exercises/exerciseSlice';

const initial = {
  logDate: '',
  exerciseName: '',
  muscleGroup: '',
  setsCompleted: '',
  repsCompleted: '',
  weightKg: '',
  durationMinutes: '',
  notes: '',
};

const ExerciseLogForm = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initial);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      logDate: form.logDate || null,
      muscleGroup: form.muscleGroup || null,
      setsCompleted: form.setsCompleted !== '' ? Number(form.setsCompleted) : null,
      repsCompleted: form.repsCompleted !== '' ? Number(form.repsCompleted) : null,
      weightKg: form.weightKg !== '' ? Number(form.weightKg) : null,
      durationMinutes: form.durationMinutes !== '' ? Number(form.durationMinutes) : null,
    };
    await dispatch(logExercise(payload));
    await dispatch(fetchExerciseLogs({ view: 'week' }));
    await dispatch(fetchTodayPlanned());
    setForm(initial);
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
      <input name="logDate" type="date" value={form.logDate} onChange={onChange} className="input" />
      <select name="muscleGroup" value={form.muscleGroup} onChange={onChange} className="input">
        <option value="">Muscle Group</option>
        <option value="CHEST">Chest</option>
        <option value="BACK">Back</option>
        <option value="LEGS">Legs</option>
        <option value="SHOULDERS">Shoulders</option>
        <option value="ARMS">Arms</option>
        <option value="CORE">Core</option>
        <option value="FULL_BODY">Full Body</option>
        <option value="CARDIO">Cardio</option>
        <option value="REST">Rest</option>
      </select>
      <input name="exerciseName" placeholder="Exercise name" value={form.exerciseName} onChange={onChange} className="col-span-2 input" />
      <input name="setsCompleted" type="number" placeholder="Sets" value={form.setsCompleted} onChange={onChange} className="input" />
      <input name="repsCompleted" type="number" placeholder="Reps" value={form.repsCompleted} onChange={onChange} className="input" />
      <input name="weightKg" type="number" step="0.1" placeholder="Weight (kg)" value={form.weightKg} onChange={onChange} className="input" />
      <input name="durationMinutes" type="number" placeholder="Duration (min)" value={form.durationMinutes} onChange={onChange} className="input" />
      <textarea name="notes" placeholder="Notes" value={form.notes} onChange={onChange} className="col-span-2 input" rows={2} />
      <div className="col-span-2">
        <button type="submit" className="btn btn-primary">Log Exercise</button>
      </div>
    </form>
  );
};

export default ExerciseLogForm;

