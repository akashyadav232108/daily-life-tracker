import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealthLogs, fetchWeeklySummary, selectHealthLogs, selectWeeklySummary, selectHealthLoading } from '../healthSlice';
import HealthLogForm from '../components/HealthLogForm';
import HealthLogList from '../components/HealthLogList';
import WeeklySummaryCard from '../components/WeeklySummaryCard';

const HealthPage = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectHealthLogs);
  const weekly = useSelector(selectWeeklySummary);
  const loading = useSelector(selectHealthLoading);

  useEffect(() => {
    dispatch(fetchHealthLogs({ view: 'week' }));
    dispatch(fetchWeeklySummary());
  }, [dispatch]);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Health</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">Log Today</h2>
            <HealthLogForm />
          </div>
          <div className="mt-6 rounded-xl bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">Recent Logs</h2>
            <HealthLogList logs={logs} loading={loading} />
          </div>
        </div>
        <div>
          <WeeklySummaryCard summary={weekly} />
        </div>
      </div>
    </div>
  );
};

export default HealthPage;

