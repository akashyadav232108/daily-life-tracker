import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { upsertHealthLog, fetchHealthLogs, fetchWeeklySummary, selectHealthLoading } from '../healthSlice';
import toast from 'react-hot-toast';

const moodOptions = [
  { value: '', label: 'Select mood…' },
  { value: 'GREAT', label: '😄 Great' },
  { value: 'GOOD', label: '🙂 Good' },
  { value: 'OKAY', label: '😐 Okay' },
  { value: 'BAD', label: '😕 Bad' },
  { value: 'TERRIBLE', label: '😞 Terrible' },
];

const initial = {
  logDate: new Date().toISOString().split('T')[0],
  waterGlasses: '',
  sleepHours: '',
  steps: '',
  weightKg: '',
  mood: '',
  notes: '',
};

const HealthLogForm = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectHealthLoading);
  const [form, setForm] = useState(initial);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.logDate) {
      toast.error('Please select a date.');
      return;
    }
    const payload = {
      ...form,
      waterGlasses: form.waterGlasses !== '' ? Number(form.waterGlasses) : null,
      sleepHours: form.sleepHours !== '' ? Number(form.sleepHours) : null,
      steps: form.steps !== '' ? Number(form.steps) : null,
      weightKg: form.weightKg !== '' ? Number(form.weightKg) : null,
      mood: form.mood || null,
    };
    try {
      await dispatch(upsertHealthLog(payload)).unwrap();
      toast.success('Health log saved!');
      await dispatch(fetchHealthLogs({ view: 'week' }));
      await dispatch(fetchWeeklySummary());
      setForm({ ...initial, logDate: form.logDate });
    } catch (err) {
      toast.error(err || 'Failed to save health log');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Row 1 — date + mood */}
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
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Mood</label>
          <select name="mood" value={form.mood} onChange={onChange} className="input w-full">
            {moodOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2 — water + sleep */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
            💧 Water (glasses)
          </label>
          <input
            name="waterGlasses"
            type="number"
            min="0"
            max="30"
            placeholder="e.g. 8"
            value={form.waterGlasses}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
            🌙 Sleep (hours)
          </label>
          <input
            name="sleepHours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="e.g. 7.5"
            value={form.sleepHours}
            onChange={onChange}
            className="input w-full"
          />
        </div>
      </div>

      {/* Row 3 — steps + weight */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
            👟 Steps
          </label>
          <input
            name="steps"
            type="number"
            min="0"
            placeholder="e.g. 10000"
            value={form.steps}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
            ⚖️ Weight (kg)
          </label>
          <input
            name="weightKg"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 70.5"
            value={form.weightKg}
            onChange={onChange}
            className="input w-full"
          />
        </div>
      </div>

      {/* Row 4 — notes */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
        <textarea
          name="notes"
          placeholder="Any notes about today's health…"
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
        {loading ? 'Saving…' : 'Save Health Log'}
      </button>
    </form>
  );
};

export default HealthLogForm;
