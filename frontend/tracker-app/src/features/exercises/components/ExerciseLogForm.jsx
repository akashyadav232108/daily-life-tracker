import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logExercise, fetchExerciseLogs, fetchTodayPlanned } from '../exerciseSlice';
import toast from 'react-hot-toast';

const MUSCLE_GROUPS = [
  { value: 'CHEST',     label: 'Chest',      emoji: '💪', color: 'bg-red-100    text-red-700    border-red-200'    },
  { value: 'BACK',      label: 'Back',       emoji: '🔙', color: 'bg-blue-100   text-blue-700   border-blue-200'   },
  { value: 'LEGS',      label: 'Legs',       emoji: '🦵', color: 'bg-green-100  text-green-700  border-green-200'  },
  { value: 'SHOULDERS', label: 'Shoulders',  emoji: '🏋️', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'ARMS',      label: 'Arms',       emoji: '💪', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'CORE',      label: 'Core',       emoji: '🔥', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'FULL_BODY', label: 'Full Body',  emoji: '⚡', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'CARDIO',    label: 'Cardio',     emoji: '🏃', color: 'bg-pink-100   text-pink-700   border-pink-200'   },
  { value: 'REST',      label: 'Rest',       emoji: '😴', color: 'bg-gray-100   text-gray-500   border-gray-200'   },
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

  const selectMuscle = (value) => {
    setForm((f) => ({ ...f, muscleGroup: f.muscleGroup === value ? '' : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.exerciseName.trim()) {
      toast.error('Please enter an exercise name.');
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
      toast.success('Exercise logged! 💪');
      await dispatch(fetchExerciseLogs({ view: 'week' }));
      await dispatch(fetchTodayPlanned());
      setForm({ ...initial, logDate: form.logDate });
    } catch (err) {
      toast.error(err || 'Failed to log exercise');
    } finally {
      setLoading(false);
    }
  };

  const selectedMuscle = MUSCLE_GROUPS.find((m) => m.value === form.muscleGroup);

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* ── Section 1: Basic info ── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">① Exercise Info</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Date</label>
            <input
              name="logDate"
              type="date"
              value={form.logDate}
              onChange={onChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Exercise Name <span className="text-red-400">*</span>
            </label>
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
        </div>
      </div>

      {/* ── Section 2: Muscle group picker ── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">② Muscle Group</p>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((m) => {
            const active = form.muscleGroup === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => selectMuscle(m.value)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? m.color + ' ring-2 ring-offset-1 ring-current shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
        {selectedMuscle && (
          <p className="mt-2 text-xs text-gray-500">
            Selected: <strong>{selectedMuscle.emoji} {selectedMuscle.label}</strong>
          </p>
        )}
      </div>

      {/* ── Section 3: Performance ── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">③ Performance</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Sets</label>
            <input
              name="setsCompleted"
              type="number"
              min="0"
              placeholder="3"
              value={form.setsCompleted}
              onChange={onChange}
              className="input w-full text-center"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Reps</label>
            <input
              name="repsCompleted"
              type="number"
              min="0"
              placeholder="10"
              value={form.repsCompleted}
              onChange={onChange}
              className="input w-full text-center"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Weight (kg)</label>
            <input
              name="weightKg"
              type="number"
              min="0"
              step="0.5"
              placeholder="60"
              value={form.weightKg}
              onChange={onChange}
              className="input w-full text-center"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Duration (min)</label>
            <input
              name="durationMinutes"
              type="number"
              min="0"
              placeholder="45"
              value={form.durationMinutes}
              onChange={onChange}
              className="input w-full text-center"
            />
          </div>
        </div>

        {/* Live preview pill */}
        {(form.setsCompleted || form.repsCompleted || form.weightKg || form.durationMinutes) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.setsCompleted && form.repsCompleted && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {form.setsCompleted} sets × {form.repsCompleted} reps
              </span>
            )}
            {form.weightKg && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                {form.weightKg} kg
              </span>
            )}
            {form.durationMinutes && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                {form.durationMinutes} min
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Notes ── */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Notes (optional)</label>
        <textarea
          name="notes"
          placeholder="How did it feel? Any new PRs?"
          value={form.notes}
          onChange={onChange}
          className="input w-full"
          rows={2}
        />
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold
                   text-white shadow-sm hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none
                   transition-colors disabled:opacity-60"
      >
        {loading ? 'Logging…' : '💪 Log Exercise'}
      </button>
    </form>
  );
};

export default ExerciseLogForm;
