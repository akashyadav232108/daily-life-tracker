import { useEffect, useState } from 'react';
import { fetchTodayHealthLog, fetchWeeklySummary } from '../../health/healthAPI';

const TodayHealthSummary = () => {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [t, w] = await Promise.all([fetchTodayHealthLog(), fetchWeeklySummary()]);
      setToday(t.data);
      setWeekly(w.data);
    };
    load();
  }, []);

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-1 text-lg font-semibold">Today — Health</h2>
      {!today ? (
        <div className="text-gray-400">No log yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Water: {today.waterGlasses ?? '-'}</div>
          <div>Sleep: {today.sleepHours ?? '-'}</div>
          <div>Steps: {today.steps ?? '-'}</div>
          <div>Weight: {today.weightKg ?? '-'}</div>
          <div className="col-span-2">Mood: {today.mood ?? '-'}</div>
        </div>
      )}
      {weekly && (
        <div className="mt-3 border-t pt-3 text-sm text-gray-600">
          <div>Averages — Water {weekly.avgWaterGlasses}, Sleep {weekly.avgSleepHours}, Steps {weekly.avgSteps}</div>
        </div>
      )}
    </div>
  );
};

export default TodayHealthSummary;

