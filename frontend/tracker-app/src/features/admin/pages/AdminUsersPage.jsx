import { useState, useEffect, useMemo } from 'react';
import {
  HiMagnifyingGlass,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiShieldCheck,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';
import {
  adminFetchAllUsers,
  adminActivateUser,
  adminDeactivateUser,
  adminChangeUserRole,
  adminDeleteUser,
  adminFetchUserStats,
} from '../adminAPI';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
import { ROLES } from '../../../utils/constants';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ROLE_STYLES = {
  USER: 'bg-gray-100 text-gray-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
};

const ROLE_DESCRIPTIONS = {
  USER: 'Can only manage their own data',
  ADMIN: 'Can manage users and view platform stats',
  SUPER_ADMIN: 'Full platform access and control',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const { isSuperAdmin, isAdmin, user: currentUser } = useAuth();

  // ── Data state ──
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Filter state ──
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Action modal state ──
  const [actionTarget, setActionTarget] = useState(null);  // target user object
  const [actionType, setActionType] = useState(null);       // 'activate' | 'deactivate' | 'delete' | 'role'
  const [selectedRole, setSelectedRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Load users + stats on mount ──
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users (large page) — filter/paginate client-side
      const res = await adminFetchAllUsers({ size: 500, sortBy: 'createdAt', sortDir: 'desc' });
      setAllUsers(res.data?.content || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminFetchUserStats();
      setStats(res.data);
    } catch {
      // stats non-critical, silently fail
    } finally {
      setStatsLoading(false);
    }
  };

  // ── Client-side filtering ──
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchRole = !roleFilter || u.role === roleFilter;
      const active = u.isActive ?? u.active;
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'active' && active) ||
        (statusFilter === 'inactive' && !active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // ── Permission guard: can the logged-in admin act on this user? ──
  const canModify = (target) => {
    if (target.id === currentUser?.id) return false; // can't modify self
    if (isSuperAdmin) return true;
    // Regular ADMIN can only modify plain USERs
    return target.role === ROLES.USER;
  };

  // ── Open action modal ──
  const openAction = (user, type) => {
    setActionTarget(user);
    setActionType(type);
    if (type === 'role') {
      // Pre-select the opposite role as default
      setSelectedRole(user.role === ROLES.USER ? ROLES.ADMIN : ROLES.USER);
    }
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
    setSelectedRole('');
  };

  // ── Execute the action ──
  const handleConfirmAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'activate') {
        await adminActivateUser(actionTarget.id);
        patchUser(actionTarget.id, { isActive: true });
        toast.success(`${actionTarget.fullName} has been activated`);
      } else if (actionType === 'deactivate') {
        await adminDeactivateUser(actionTarget.id);
        patchUser(actionTarget.id, { isActive: false });
        toast.success(`${actionTarget.fullName} has been deactivated`);
      } else if (actionType === 'delete') {
        await adminDeleteUser(actionTarget.id);
        setAllUsers((prev) => prev.filter((u) => u.id !== actionTarget.id));
        toast.success(`${actionTarget.fullName} deleted permanently`);
        loadStats();
      } else if (actionType === 'role') {
        await adminChangeUserRole(actionTarget.id, { role: selectedRole });
        patchUser(actionTarget.id, { role: selectedRole });
        toast.success(`Role updated to ${selectedRole.replace('_', ' ')} for ${actionTarget.fullName}`);
        loadStats();
      }
      closeAction();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Optimistically update one user in the list ──
  const patchUser = (userId, changes) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...changes } : u))
    );
  };

  // Roles available for assignment (SUPER_ADMIN can set all; ADMIN can only set USER/ADMIN)
  const availableRoles = isSuperAdmin
    ? [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
    : [ROLES.USER, ROLES.ADMIN];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all platform users, roles, and account status.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Users"
          value={statsLoading ? '—' : (stats?.totalUsers ?? 0)}
          color="bg-gray-50 text-gray-700"
          icon={<HiUsers className="h-5 w-5" />}
        />
        <StatCard
          label="Active"
          value={statsLoading ? '—' : (stats?.activeUsers ?? 0)}
          color="bg-green-50 text-green-700"
          icon={<HiCheckCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Inactive"
          value={statsLoading ? '—' : (stats?.inactiveUsers ?? 0)}
          color="bg-red-50 text-red-700"
          icon={<HiXCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Admins"
          value={
            statsLoading
              ? '—'
              : (stats?.roleDistribution?.ADMIN ?? 0) +
                (stats?.roleDistribution?.SUPER_ADMIN ?? 0)
          }
          color="bg-purple-50 text-purple-700"
          icon={<HiShieldCheck className="h-5 w-5" />}
        />
      </div>

      {/* ── Search + Filters ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Result count */}
        {!loading && (
          <span className="whitespace-nowrap text-sm text-gray-400">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState hasFilters={!!(search || roleFilter || statusFilter)} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-sm ring-1 ring-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>ID</Th>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pagedUsers.map((user) => {
                  const isActive = user.isActive ?? user.active;
                  const isSelf = user.id === currentUser?.id;
                  const modifiable = canModify(user);

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50">

                      {/* ID */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-400">
                        #{user.id}
                      </td>

                      {/* User info */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {user.fullName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] font-normal text-gray-400">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role] || ROLE_STYLES.USER}`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* Activate / Deactivate */}
                          {modifiable && (
                            isActive ? (
                              <ActionBtn
                                label="Deactivate"
                                onClick={() => openAction(user, 'deactivate')}
                                variant="warning"
                              />
                            ) : (
                              <ActionBtn
                                label="Activate"
                                onClick={() => openAction(user, 'activate')}
                                variant="success"
                              />
                            )
                          )}

                          {/* Change Role — ADMIN+ but only on modifiable users */}
                          {isAdmin && modifiable && (
                            <ActionBtn
                              label="Role"
                              onClick={() => openAction(user, 'role')}
                              variant="primary"
                            />
                          )}

                          {/* Delete — SUPER_ADMIN only, not self, not other SUPER_ADMINs */}
                          {isSuperAdmin && !isSelf && user.role !== ROLES.SUPER_ADMIN && (
                            <ActionBtn
                              label="Delete"
                              onClick={() => openAction(user, 'delete')}
                              variant="danger"
                            />
                          )}

                          {/* No actions available */}
                          {!modifiable && !isSelf && (
                            <span className="text-xs text-gray-300 italic">—</span>
                          )}
                          {isSelf && (
                            <span className="text-xs text-gray-300 italic">own account</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-1">
                <PaginationBtn
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <HiChevronLeft className="h-4 w-4" />
                </PaginationBtn>

                {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
                      …
                    </span>
                  ) : (
                    <PaginationBtn
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      active={p === currentPage}
                    >
                      {p}
                    </PaginationBtn>
                  )
                )}

                <PaginationBtn
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <HiChevronRight className="h-4 w-4" />
                </PaginationBtn>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Confirm: Activate / Deactivate / Delete ── */}
      <ConfirmDialog
        isOpen={
          actionType === 'activate' ||
          actionType === 'deactivate' ||
          actionType === 'delete'
        }
        title={
          actionType === 'activate'
            ? 'Activate User'
            : actionType === 'deactivate'
            ? 'Deactivate User'
            : 'Delete User Permanently'
        }
        message={
          actionType === 'activate'
            ? `Activate ${actionTarget?.fullName}? They will regain full access to the platform.`
            : actionType === 'deactivate'
            ? `Deactivate ${actionTarget?.fullName}? They will lose access to the platform immediately.`
            : `Permanently delete ${actionTarget?.fullName} (${actionTarget?.email})? This cannot be undone.`
        }
        confirmText={
          actionType === 'activate'
            ? 'Activate'
            : actionType === 'deactivate'
            ? 'Deactivate'
            : 'Delete Permanently'
        }
        variant={actionType === 'activate' ? 'info' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={closeAction}
      />

      {/* ── Change Role Modal ── */}
      {actionType === 'role' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeAction} />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update role for{' '}
              <span className="font-medium text-gray-800">{actionTarget.fullName}</span>
            </p>

            {/* Current role */}
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Current Role
              </p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[actionTarget.role]}`}>
                {actionTarget.role?.replace('_', ' ')}
              </span>
            </div>

            {/* New role selector */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assign New Role
              </p>
              <div className="space-y-2">
                {availableRoles
                  .filter((r) => r !== actionTarget.role)
                  .map((role) => (
                    <label
                      key={role}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedRole === role
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newRole"
                        value={role}
                        checked={selectedRole === role}
                        onChange={() => setSelectedRole(role)}
                        className="mt-0.5 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[role]}`}>
                          {role.replace('_', ' ')}
                        </span>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeAction}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={!selectedRole || actionLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Updating…' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, icon }) => (
  <div className={`flex items-start gap-3 rounded-xl p-4 ${color}`}>
    <div className="mt-0.5 opacity-60">{icon}</div>
    <div>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Th = ({ children, align = 'left' }) => (
  <th
    className={`bg-gray-50 px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wider text-gray-500`}
  >
    {children}
  </th>
);

const ACTION_VARIANT_CLASSES = {
  success: 'bg-green-50 text-green-700 hover:bg-green-100',
  warning: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  danger:  'bg-red-50   text-red-700   hover:bg-red-100',
  primary: 'bg-primary/10 text-primary   hover:bg-primary/20',
};

const ActionBtn = ({ label, onClick, variant = 'primary' }) => (
  <button
    onClick={onClick}
    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${ACTION_VARIANT_CLASSES[variant]}`}
  >
    {label}
  </button>
);

const PaginationBtn = ({ children, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex min-w-[32px] items-center justify-center rounded-lg border px-2 py-1 text-xs font-medium transition-colors
      ${active
        ? 'border-primary bg-primary text-white'
        : 'border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
      }`}
  >
    {children}
  </button>
);

const EmptyState = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
    <HiUsers className="h-12 w-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-semibold text-gray-600">
      {hasFilters ? 'No users match your filters' : 'No users found'}
    </h3>
    <p className="mt-1 text-sm text-gray-400">
      {hasFilters
        ? 'Try adjusting your search or clearing the filters.'
        : 'Users will appear here once they register.'}
    </p>
  </div>
);

// ─── Pagination helper ────────────────────────────────────────────────────────

/**
 * Builds the page number array with ellipsis placeholders.
 * e.g. [1, '...', 4, 5, 6, '...', 10]
 */
const buildPageNumbers = (current, total) => {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
};

export default AdminUsersPage;
