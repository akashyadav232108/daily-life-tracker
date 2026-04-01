import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from './taskAPI';

// ─── Async Thunks ────────────────────────────────────────────────

/** Fetch tasks with optional filters: { date, from, to, status, priority, view } */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.fetchTasks(params);
      return response.data; // TaskResponse[]
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

/** Create a new task */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(taskData);
      return response.data; // TaskResponse
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

/** Update an existing task */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(taskId, taskData);
      return response.data; // TaskResponse
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

/** Mark task as completed */
export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskAPI.completeTask(taskId);
      return response.data; // TaskResponse
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete task');
    }
  }
);

/** Reopen a completed task */
export const reopenTask = createAsyncThunk(
  'tasks/reopenTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskAPI.reopenTask(taskId);
      return response.data; // TaskResponse
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reopen task');
    }
  }
);

/** Delete a task */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(taskId);
      return taskId; // return id so reducer can remove it
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────

const initialState = {
  tasks: [],
  loading: false,
  error: null,

  // Filters (current active filters — synced with query params in the page)
  filters: {
    view: 'today',   // 'today' | 'week' | 'month' | '' (all)
    status: '',       // '' | 'PENDING' | 'COMPLETED'
    priority: '',     // '' | 'HIGH' | 'MEDIUM' | 'LOW'
    date: '',         // specific date YYYY-MM-DD
    from: '',         // range start
    to: '',           // range end
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** Update one or more filter values */
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    /** Reset all filters to default */
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    /** Clear task-level error */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Tasks ──
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Create Task ──
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload); // add to top
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Update Task ──
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Complete Task ──
    builder
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Reopen Task ──
    builder
      .addCase(reopenTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(reopenTask.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Delete Task ──
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearError } = taskSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────
export const selectTasks = (state) => state.tasks.tasks;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectFilters = (state) => state.tasks.filters;

// Computed selectors
export const selectTaskStats = (state) => {
  const tasks = state.tasks.tasks;
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, completionRate };
};

export default taskSlice.reducer;
