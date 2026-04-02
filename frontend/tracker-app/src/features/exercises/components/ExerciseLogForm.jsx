import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logExercise, fetchExerciseLogs, fetchTodayPlanned } from '../exerciseSlice';
import toast from 'react-hot-toast';

const muscleOptions = [
  { value: '', label: 'Select muscle group…' },
  { value: 'CHEST', label: '💪 Chest' },
  { value: 'BACK', label: '🔙 Back' },
  { value: 'LEGS', label: '🦵 Legs' },
  { value: 'SHOULDERS', label: '🏋️ Shoulders' },
  { value: 'ARMS', label: '💪 Arms' },
  { value: 'CORE', label: '🔥 Core' },
  { value: 'FULL_BODY', label: '⚡ Full Body' },
  { value: 'CARDIO', label: '🏃 Cardio' },
  { value: 'REST', label: '😴 Rest' },
];

const initial = {
  logDate: new Date().toISOString().split('T')[0],
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
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.exerciseName.trim()) {
      toast.error('Exercise name is required.');
      return;
    }
    const payload = {
      ...form,
      logDate: form.logDate || null,
      muscleGroup: form.muscleGroup || null,
      setsCompleted: form.setsCompleted !== '' ? Number(form.setsCompleted) : null,
      repsCompleted: form.repsCompleted !== '' ? Number(form.repsCompleted) : null,
      weightKg: form.weightKg !== '' ? Number(form.weightKg) : null,
      durationMinutes: form.durationMinutes !== '' ? Number(form.durationMinutes) : null,
    };
    try {
      setLoading(true);
      await dispatch(logExercise(payload)).unwrap();
      toast.success('Exercise logged!');
      await dispatch(fetchExerciseLogs({ view: 'week' }));
      await dispatch(fetchTodayPlanned());
      setForm({ ...initial, logDate: form.logDate });
    } catch (err) {
      toast.error(err || 'Failed to log exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Row 1 — date + muscle group */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Date</label>
          <input
            name="logDate"
            type="date"
            value={form.logDate}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Muscle Group</label>
          <select name="muscleGroup" value={form.muscleGroup} onChange={onChange} className="input w-full">
            {muscleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise name */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Exercise Name *</label>
        <input
          name="exerciseName"
          type="text"
          placeholder="e.g. Bench Press, Running…"
          value={form.exerciseName}
          onChange={onChange}
          className="input w-full"
          required
        />
      </div>

      {/* Row 2 — sets + reps */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Sets</label>
          <input
            name="setsCompleted"
            type="number"
            min="0"
            placeholder="e.g. 3"
            value={form.setsCompleted}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Reps</label>
          <input
            name="repsCompleted"
            type="number"
            min="0"
            placeholder="e.g. 10"
            value={form.repsCompleted}
            onChange={onChange}
            className="input w-full"
          />
        </div>
      </div>

      {/* Row 3 — weight + duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Weight (kg)</label>
          <input
            name="weightKg"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 60"
            value={form.weightKg}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Duration (min)</label>
          <input
            name="durationMinutes"
            type="number"
            min="0"
            placeholder="e.g. 45"
            value={form.durationMinutes}
            onChange={onChange}
            className="input w-full"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
        <textarea
          name="notes"
          placeholder="How did it feel? Any PRs today?"
          value={form.notes}
          onChange={onChange}
          className="input w-full"
          rows={2}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium
                   text-white shadow-sm hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none
                   transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Log Exercise'}
      </button>
    </form>
  );
};

export default ExerciseLogForm;
