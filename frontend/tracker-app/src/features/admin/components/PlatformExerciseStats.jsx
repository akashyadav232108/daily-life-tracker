import { useEffect, useState } from 'react';
import { adminFetchExerciseStats } from '../adminAPI';
import { HiBolt, HiChartBar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Card = ({ icon: Icon, label, value, color }) => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  </div>
);

const PlatformExerciseStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetchExerciseStats();
        setStats(res.data);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load exercise stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="h-24 animate-pulse rounded-xl bg-gray-100" />;
  if (!stats) return null;

  const popularCount = Object.values(stats.popularMuscleGroups || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card icon={HiBolt} label="Active Plans" value={stats.activePlans} color="bg-blue-600" />
      <Card icon={HiChartBar} label="Muscle Group Entries" value={popularCount} color="bg-purple-600" />
    </div>
  );
};

export default PlatformExerciseStats;

