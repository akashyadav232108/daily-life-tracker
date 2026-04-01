import { useState } from 'react';
import { HiMagnifyingGlass, HiTrash } from 'react-icons/hi2';
import { adminFetchAllUsers, adminFetchUserTasks, adminDeleteTask } from '../adminAPI';
import { PRIORITY_COLORS, STATUS_LABELS, RECURRENCE_LABELS } from '../../../utils/constants';
import { formatDate, isOverdue } from '../../../utils/dateUtils';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const UserTaskSearch = () => {
  const { isSuperAdmin } = useAuth();

  // User search state
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Selected user + tasks
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Search users ──
  const handleSearchUsers = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setUsersLoading(true);
    setSelectedUser(null);
    setTasks([]);
    try {
      const response = await adminFetchAllUsers({ search: searchTerm.trim(), size: 10 });
      setUsers(response.data?.content || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to search users');
    } finally {
      setUsersLoading(false);
    }
  };

  // ── Load tasks for selected user ──
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setTasksLoading(true);
    try {
      const response = await adminFetchUserTasks(user.id);
      setTasks(response.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  // ── Delete task (SUPER_ADMIN) ──
  const handleDeleteTask = async () => {
    if (!deleteTarget) return;
    try {
      await adminDeleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearchUsers} className="flex gap-3">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={usersLoading}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {/* User results */}
      {usersLoading ? (
        <LoadingSpinner className="h-20" />
      ) : users.length > 0 ? (
        <div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-colors hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{user.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive ?? user.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {(user.isActive ?? user.active) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      View Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : searchTerm && !usersLoading ? (
        <p className="text-center text-sm text-gray-400">No users found for "{searchTerm}".</p>
      ) : null}

      {/* Selected user's tasks */}
      {selectedUser && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tasks for {selectedUser.fullName}
              </h3>
              <p className="text-sm text-gray-500">{selectedUser.email} • {tasks.length} task(s)</p>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setTasks([]);
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>

          <div className="p-6">
            {tasksLoading ? (
              <LoadingSpinner className="h-32" />
            ) : tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">This user has no tasks.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
                  const taskOverdue = task.status === 'PENDING' && isOverdue(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        taskOverdue ? 'border-red-200 bg-red-50/50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-medium ${
                              task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}
                          >
                            {task.priority}
                          </span>
                          {taskOverdue && (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                        )}
                        <div className="mt-1 flex gap-3 text-xs text-gray-400">
                          <span>Due: {formatDate(task.dueDate)}</span>
                          <span>Status: {STATUS_LABELS[task.status]}</span>
                          {task.recurrenceType !== 'NONE' && (
                            <span>{RECURRENCE_LABELS[task.recurrenceType]}</span>
                          )}
                        </div>
                      </div>

                      {/* SUPER_ADMIN can delete any task */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete this task"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default UserTaskSearch;
