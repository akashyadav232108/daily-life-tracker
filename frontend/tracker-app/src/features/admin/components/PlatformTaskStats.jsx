import { useState, useEffect } from 'react';
import {
  HiClipboardDocumentList,
  HiClock,
  HiCheckCircle,
  HiChartBar,
  HiUsers,
} from 'react-icons/hi2';
import { adminFetchTaskStats } from '../adminAPI';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  </div>
);

const PlatformTaskStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminFetchTaskStats();
        setStats(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load task stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        icon={HiClipboardDocumentList}
        label="Total Tasks"
        value={stats.totalTasks}
        color="bg-blue-500"
      />
      <StatCard
        icon={HiClock}
        label="Pending"
        value={stats.pendingTasks}
        color="bg-yellow-500"
      />
      <StatCard
        icon={HiCheckCircle}
        label="Completed"
        value={stats.completedTasks}
        color="bg-green-500"
      />
      <StatCard
        icon={HiChartBar}
        label="Completion Rate"
        value={`${stats.completionRate?.toFixed(1) ?? 0}%`}
        color="bg-purple-500"
      />
      <StatCard
        icon={HiUsers}
        label="Active Users"
        value={stats.activeUsers}
        color="bg-indigo-500"
        subtext="Users with tasks"
      />
    </div>
  );
};

export default PlatformTaskStats;
