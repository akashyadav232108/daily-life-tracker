import { useEffect, useState } from 'react';
import { adminFetchHealthStats } from '../adminAPI';
import { HiHeart, HiFaceSmile, HiUsers } from 'react-icons/hi2';
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

const PlatformHealthStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetchHealthStats();
        setStats(res.data);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load health stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="h-24 animate-pulse rounded-xl bg-gray-100" />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card icon={HiHeart} label="Health Logs (7d)" value={stats.totalLogs7d} color="bg-rose-500" />
      <Card icon={HiUsers} label="Active Loggers (7d)" value={stats.activeLoggers7d} color="bg-indigo-500" />
      <Card icon={HiFaceSmile} label="Moods Tracked (7d)" value={Object.keys(stats.moodDistribution7d || {}).length} color="bg-emerald-500" />
    </div>
  );
};

export default PlatformHealthStats;

