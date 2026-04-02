import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  createPlan,
  deletePlan,
  activatePlan,
  fetchPlans,
  fetchActivePlan,
  fetchTodayPlanned,
} from '../exerciseSlice';
import { HiPlus, HiTrash, HiBolt, HiCheckCircle, HiChevronDown, HiChevronUp, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = { MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED', THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'SAT', SUNDAY: 'SUN' };

const MUSCLES = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'CARDIO', 'REST'];
const MUSCLE_COLOR = {
  CHEST: 'bg-red-100 text-red-700 border-red-200',
  BACK: 'bg-blue-100 text-blue-700 border-blue-200',
  LEGS: 'bg-green-100 text-green-700 border-green-200',
  SHOULDERS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ARMS: 'bg-orange-100 text-orange-700 border-orange-200',
  CORE: 'bg-purple-100 text-purple-700 border-purple-200',
  FULL_BODY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  CARDIO: 'bg-pink-100 text-pink-700 border-pink-200',
  REST: 'bg-gray-100 text-gray-500 border-gray-200',
};

const emptyGrid = () =>
  DAYS.map((d) => ({ dayOfWeek: d, muscleGroup: 'REST', notes: '', exercises: [] }));

// ─── My Plans list ──────────────────────────────────────────────
const MyPlans = ({ plans, activePlan, onActivate, onDelete }) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
        No plans yet. Create one below.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {plans.map((p) => {
        const isActive = activePlan?.id === p.id || p.isActive;
        return (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
              isActive ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isActive && <HiCheckCircle className="h-4 w-4 shrink-0 text-primary" />}
              <span className="truncate text-sm font-medium text-gray-800">{p.planName}</span>
              {isActive && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              {!isActive && (
                <button
                  onClick={() => onActivate(p.id)}
                  className="rounded-lg border border-primary/30 bg-white px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => onDelete(p.id, p.planName)}
                className="rounded-lg border border-red-200 bg-white p-1.5 text-red-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
              >
                <HiTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Day row in builder ──────────────────────────────────────────
const DayRow = ({ row, idx, onSetMuscle, onAddExercise, onExerciseChange, onRemoveExercise }) => {
  const [expanded, setExpanded] = useState(false);
  const isRest = row.muscleGroup === 'REST';

  return (
    <div className={`rounded-xl border transition ${isRest ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'}`}>
      {/* Day header */}
      <div className="flex items-center gap-3 p-3">
        {/* Day badge */}
        <span className="w-10 shrink-0 text-center rounded-lg bg-gray-100 py-1 text-xs font-bold text-gray-600">
          {DAY_SHORT[row.dayOfWeek]}
        </span>

        {/* Muscle selector */}
        <div className="flex flex-1 flex-wrap gap-1.5">
          {MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSetMuscle(idx, m)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                row.muscleGroup === m
                  ? MUSCLE_COLOR[m] + ' ring-1 ring-offset-0'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Expand toggle (only if not rest) */}
        {!isRest && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="ml-1 shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Exercise rows (expanded) */}
      {!isRest && expanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          {row.exercises.length > 0 && (
            <div className="mb-2 space-y-2">
              {row.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="flex items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Exercise name"
                    value={ex.exerciseName}
                    onChange={(e) => onExerciseChange(idx, exIdx, 'exerciseName', e.target.value)}
                  />
                  <input
                    className="input w-16 text-sm text-center"
                    type="number"
                    min="1"
                    placeholder="Sets"
                    value={ex.numSets}
                    onChange={(e) => onExerciseChange(idx, exIdx, 'numSets', e.target.value)}
                  />
                  <span className="text-xs text-gray-400">×</span>
                  <input
                    className="input w-16 text-sm text-center"
                    type="number"
                    min="1"
                    placeholder="Reps"
                    value={ex.numReps}
                    onChange={(e) => onExerciseChange(idx, exIdx, 'numReps', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveExercise(idx, exIdx)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <HiXMark className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onAddExercise(idx)}
            className="flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-primary/40 hover:text-primary transition w-full justify-center"
          >
            <HiPlus className="h-3.5 w-3.5" /> Add exercise
          </button>
        </div>
      )}

      {/* Rest day label */}
      {isRest && (
        <div className="px-3 pb-2 text-xs text-gray-400 italic">Rest — no exercises</div>
      )}
    </div>
  );
};

// ─── Main PlanBuilder ────────────────────────────────────────────
const PlanBuilder = ({ plans, activePlan }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [planName, setPlanName] = useState('');
  const [grid, setGrid] = useState(emptyGrid);
  const [saving, setSaving] = useState(false);

  const onSetMuscle = (idx, val) =>
    setGrid((g) =>
      g.map((row, i) =>
        i === idx ? { ...row, muscleGroup: val, exercises: val === 'REST' ? [] : row.exercises } : row
      )
    );

  const onAddExercise = (idx) =>
    setGrid((g) =>
      g.map((row, i) =>
        i === idx
          ? { ...row, exercises: [...row.exercises, { exerciseName: '', numSets: 3, numReps: 10, orderIndex: row.exercises.length + 1 }] }
          : row
      )
    );

  const onRemoveExercise = (dayIdx, exIdx) =>
    setGrid((g) =>
      g.map((row, i) =>
        i === dayIdx ? { ...row, exercises: row.exercises.filter((_, j) => j !== exIdx) } : row
      )
    );

  const onExerciseChange = (dayIdx, exIdx, field, value) =>
    setGrid((g) =>
      g.map((row, i) => {
        if (i !== dayIdx) return row;
        const exs = row.exercises.map((ex, j) =>
          j === exIdx ? { ...ex, [field]: field === 'exerciseName' ? value : Number(value) } : ex
        );
        return { ...row, exercises: exs };
      })
    );

  const payload = useMemo(
    () => ({
      planName: planName.trim() || 'My Plan',
      days: grid.map((r) => ({
        ...r,
        exercises: r.muscleGroup === 'REST' ? [] : r.exercises,
      })),
    }),
    [planName, grid]
  );

  const onCreate = async () => {
    try {
      setSaving(true);
      await dispatch(createPlan(payload)).unwrap();
      toast.success(`Plan "${payload.planName}" created!`);
      await dispatch(fetchPlans());
      await dispatch(fetchActivePlan());
      // Reset form
      setPlanName('');
      setGrid(emptyGrid());
      setShowForm(false);
    } catch (err) {
      toast.error(err || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const onActivate = async (id) => {
    try {
      await dispatch(activatePlan(id)).unwrap();
      toast.success('Plan activated!');
      await dispatch(fetchPlans());
      await dispatch(fetchActivePlan());
      await dispatch(fetchTodayPlanned());
    } catch {
      toast.error('Failed to activate plan');
    }
  };

  const onDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try {
      await dispatch(deletePlan(id)).unwrap();
      toast.success(`Plan "${name}" deleted.`);
      await dispatch(fetchPlans());
      await dispatch(fetchActivePlan());
      await dispatch(fetchTodayPlanned());
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── My Plans ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">My Plans</p>
        <MyPlans plans={plans} activePlan={activePlan} onActivate={onActivate} onDelete={onDelete} />
      </div>

      {/* ── Create new plan ── */}
      <div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-primary/40 hover:text-primary transition"
          >
            <HiPlus className="h-4 w-4" /> Create New Plan
          </button>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">New Weekly Plan</p>
              <button
                type="button"
                onClick={() => { setShowForm(false); setPlanName(''); setGrid(emptyGrid()); }}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </div>

            {/* Plan name */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Plan Name</label>
              <input
                className="input w-full"
                placeholder="e.g. Push-Pull-Legs"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            {/* Day builder */}
            <div className="mb-4 space-y-2">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Weekly Schedule — click a muscle group, then expand to add exercises
              </label>
              {grid.map((row, idx) => (
                <DayRow
                  key={row.dayOfWeek}
                  row={row}
                  idx={idx}
                  onSetMuscle={onSetMuscle}
                  onAddExercise={onAddExercise}
                  onExerciseChange={onExerciseChange}
                  onRemoveExercise={onRemoveExercise}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={onCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 transition"
            >
              <HiBolt className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanBuilder;
