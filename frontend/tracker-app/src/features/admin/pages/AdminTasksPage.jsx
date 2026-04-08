import {
  HiChartBarSquare,
  HiMagnifyingGlassCircle,
  HiLockClosed,
} from 'react-icons/hi2';
import PlatformTaskStats from '../components/PlatformTaskStats';
import PlatformHealthStats from '../components/PlatformHealthStats';
import PlatformExerciseStats from '../components/PlatformExerciseStats';
import UserTaskSearch from '../components/UserTaskSearch';
import useAuth from '../../../hooks/useAuth';

const AdminTasksPage = () => {
  const { isSuperAdmin } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task &amp; Activity Lookup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide aggregate statistics — visible to all admins.
          Individual user task lookup is restricted to Super Admins only.
        </p>
      </div>

      {/* ── Platform Statistics — all admins ── */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <HiChartBarSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Platform Statistics</h2>
          <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
            All Admins
          </span>
        </div>
        <div className="space-y-6">
          <PlatformTaskStats />
          <PlatformHealthStats />
          <PlatformExerciseStats />
        </div>
      </section>

      {/* ── User Task Lookup — SUPER_ADMIN only ── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <HiMagnifyingGlassCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">User Task Lookup</h2>
          <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
            Super Admin Only
          </span>
        </div>

        {isSuperAdmin ? (
          <UserTaskSearch />
        ) : (
          <RestrictedSection />
        )}
      </section>
    </div>
  );
};

// ─── Restricted access placeholder for regular ADMINs ─────────────────────────

const RestrictedSection = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
      <HiLockClosed className="h-6 w-6 text-purple-600" />
    </div>
    <h3 className="mt-4 text-base font-semibold text-gray-700">
      Super Admin Access Required
    </h3>
    <p className="mt-2 max-w-sm text-sm text-gray-500">
      Viewing individual users' task data is restricted to Super Admins to protect
      user confidentiality. Platform-wide aggregate stats above are available to all admins.
    </p>
  </div>
);

export default AdminTasksPage;
