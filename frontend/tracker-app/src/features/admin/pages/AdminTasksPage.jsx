import { HiChartBarSquare, HiMagnifyingGlassCircle } from 'react-icons/hi2';
import PlatformTaskStats from '../components/PlatformTaskStats';
import UserTaskSearch from '../components/UserTaskSearch';

const AdminTasksPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin — Task Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide task statistics and user task management.
        </p>
      </div>

      {/* Platform Stats */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <HiChartBarSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Platform Statistics</h2>
        </div>
        <PlatformTaskStats />
      </section>

      {/* User Task Lookup */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <HiMagnifyingGlassCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">User Task Lookup</h2>
        </div>
        <UserTaskSearch />
      </section>
    </div>
  );
};

export default AdminTasksPage;
