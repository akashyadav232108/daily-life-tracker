import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './exerciseAPI';

// ─── Async Thunks ────────────────────────────────────────────────
export const createPlan = createAsyncThunk(
  'exercise/createPlan',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.createPlan(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create plan');
    }
  }
);

export const fetchPlans = createAsyncThunk(
  'exercise/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchPlans();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const fetchActivePlan = createAsyncThunk(
  'exercise/fetchActivePlan',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchActivePlan();
      return res.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch active plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'exercise/updatePlan',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.updatePlan(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update plan');
    }
  }
);

export const deletePlan = createAsyncThunk(
  'exercise/deletePlan',
  async (id, { rejectWithValue }) => {
    try {
      await api.deletePlan(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete plan');
    }
  }
);

export const activatePlan = createAsyncThunk(
  'exercise/activatePlan',
  async (id, { rejectWithValue }) => {
    try {
      await api.activatePlan(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to activate plan');
    }
  }
);

export const fetchTodayPlanned = createAsyncThunk(
  'exercise/fetchTodayPlanned',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchTodayPlanned();
      return res.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch today plan');
    }
  }
);

export const logExercise = createAsyncThunk(
  'exercise/logExercise',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.logExercise(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to log exercise');
    }
  }
);

export const fetchExerciseLogs = createAsyncThunk(
  'exercise/fetchExerciseLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.fetchExerciseLogs(params);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch exercise logs');
    }
  }
);

export const deleteExerciseLog = createAsyncThunk(
  'exercise/deleteExerciseLog',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteExerciseLog(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete exercise log');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────
const initialState = {
  plans: [],
  activePlan: null,
  todayPlanned: null,
  logs: [],
  loading: false,
  error: null,
};

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    clearExerciseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.unshift(action.payload);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== action.payload);
      })
      .addCase(activatePlan.fulfilled, (state) => {
        // After activation, UI should refetch activePlan/plans
      })
      .addCase(fetchActivePlan.fulfilled, (state, action) => {
        state.activePlan = action.payload;
      })
      .addCase(fetchActivePlan.rejected, (state) => {
        state.activePlan = null;
      })
      .addCase(fetchTodayPlanned.fulfilled, (state, action) => {
        state.todayPlanned = action.payload;
      })
      .addCase(logExercise.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(fetchExerciseLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      })
      .addCase(deleteExerciseLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter((l) => l.id !== action.payload);
      })
      .addCase(createPlan.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updatePlan.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deletePlan.rejected, (state, action) => { state.error = action.payload; })
      .addCase(activatePlan.rejected, (state, action) => { state.error = action.payload; })
      .addCase(fetchTodayPlanned.rejected, (state, action) => { state.error = action.payload; })
      .addCase(logExercise.rejected, (state, action) => { state.error = action.payload; })
      .addCase(fetchExerciseLogs.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearExerciseError } = exerciseSlice.actions;

// Selectors
export const selectPlans = (state) => state.exercise.plans;
export const selectActivePlan = (state) => state.exercise.activePlan;
export const selectTodayPlanned = (state) => state.exercise.todayPlanned;
export const selectExerciseLogs = (state) => state.exercise.logs;
export const selectExerciseError = (state) => state.exercise.error;

export default exerciseSlice.reducer;

