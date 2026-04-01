import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  deleteTask,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  selectFilters,
  selectTaskStats,
  clearError,
} from '../taskSlice';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskFilters from '../components/TaskFilters';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { HiPlus, HiClipboardDocumentList } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const loading = useSelector(selectTasksLoading);
  const error = useSelector(selectTasksError);
  const filters = useSelector(selectFilters);
  const stats = useSelector(selectTaskStats);

  // ── Modal states ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch tasks whenever filters change ──
  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  // ── Show error toast ──
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ── Handlers ──
  const openCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    // Re-fetch to get the latest list after create/update
    dispatch(fetchTasks(filters));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteTask(deleteTarget.id)).unwrap();
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err || 'Failed to delete task');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your daily tasks
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium
                     text-white shadow-sm hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none
                     transition-colors"
        >
          <HiPlus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} color="bg-gray-100 text-gray-700" />
        <StatCard label="Pending" value={stats.pending} color="bg-blue-50 text-blue-700" />
        <StatCard label="Completed" value={stats.completed} color="bg-green-50 text-green-700" />
        <StatCard
          label="Completion"
          value={`${stats.completionRate}%`}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* ── Filters ── */}
      <TaskFilters />

      {/* ── Task List ── */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : tasks.length === 0 ? (
        <EmptyState onCreateClick={openCreateForm} />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <TaskForm isOpen={isFormOpen} onClose={closeForm} editingTask={editingTask} />

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-xl p-4 ${color}`}>
    <p className="text-xs font-medium opacity-75">{label}</p>
    <p className="mt-1 text-xl font-bold">{value}</p>
  </div>
);

const EmptyState = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
    <HiClipboardDocumentList className="h-12 w-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-semibold text-gray-600">No tasks found</h3>
    <p className="mt-1 text-sm text-gray-400">
      Create your first task or adjust your filters.
    </p>
    <button
      onClick={onCreateClick}
      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium
                 text-white hover:bg-primary-dark transition-colors"
    >
      <HiPlus className="h-4 w-4" />
      Create Task
    </button>
  </div>
);

export default TasksPage;
