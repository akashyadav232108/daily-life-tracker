import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { upsertHealthLog, fetchHealthLogs, fetchWeeklySummary } from '../healthSlice';

const initial = {
  logDate: '',
  waterGlasses: '',
  sleepHours: '',
  steps: '',
  weightKg: '',
  mood: '',
  notes: '',
};

const HealthLogForm = () => {
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
      waterGlasses: form.waterGlasses !== '' ? Number(form.waterGlasses) : null,
      sleepHours: form.sleepHours !== '' ? Number(form.sleepHours) : null,
      steps: form.steps !== '' ? Number(form.steps) : null,
      weightKg: form.weightKg !== '' ? Number(form.weightKg) : null,
      mood: form.mood || null,
      logDate: form.logDate || null,
    };
    await dispatch(upsertHealthLog(payload));
    await dispatch(fetchHealthLogs({ view: 'week' }));
    await dispatch(fetchWeeklySummary());
    setForm(initial);
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
      <input name="logDate" type="date" value={form.logDate} onChange={onChange} className="input" />
      <select name="mood" value={form.mood} onChange={onChange} className="input">
        <option value="">Mood</option>
        <option value="GREAT">Great</option>
        <option value="GOOD">Good</option>
        <option value="OKAY">Okay</option>
        <option value="BAD">Bad</option>
        <option value="TERRIBLE">Terrible</option>
      </select>
      <input name="waterGlasses" type="number" placeholder="Water (glasses)" value={form.waterGlasses} onChange={onChange} className="input" />
      <input name="sleepHours" type="number" step="0.1" placeholder="Sleep (hours)" value={form.sleepHours} onChange={onChange} className="input" />
      <input name="steps" type="number" placeholder="Steps" value={form.steps} onChange={onChange} className="input" />
      <input name="weightKg" type="number" step="0.1" placeholder="Weight (kg)" value={form.weightKg} onChange={onChange} className="input" />
      <textarea name="notes" placeholder="Notes" value={form.notes} onChange={onChange} className="col-span-2 input" rows={2} />
      <div className="col-span-2">
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};

export default HealthLogForm;

