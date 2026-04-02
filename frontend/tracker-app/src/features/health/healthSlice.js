import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './healthAPI';

// ─── Async Thunks ────────────────────────────────────────────────
export const upsertHealthLog = createAsyncThunk(
  'health/upsertHealthLog',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.upsertHealthLog(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save health log');
    }
  }
);

export const fetchHealthLogs = createAsyncThunk(
  'health/fetchHealthLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.fetchHealthLogs(params);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch health logs');
    }
  }
);

export const fetchWeeklySummary = createAsyncThunk(
  'health/fetchWeeklySummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchWeeklySummary();
      return res.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weekly summary');
    }
  }
);

export const createMetric = createAsyncThunk(
  'health/createMetric',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.createMetric(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create metric');
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'health/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchMetrics();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

export const deleteMetric = createAsyncThunk(
  'health/deleteMetric',
  async (metricId, { rejectWithValue }) => {
    try {
      await api.deleteMetric(metricId);
      return metricId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete metric');
    }
  }
);

export const logMetricValue = createAsyncThunk(
  'health/logMetricValue',
  async ({ metricId, payload }, { rejectWithValue }) => {
    try {
      await api.logMetricValue(metricId, payload);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to log metric value');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────
const initialState = {
  logs: [],
  metrics: [],
  weeklySummary: null,
  loading: false,
  error: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(upsertHealthLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertHealthLog.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.logs.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.logs[idx] = action.payload;
        else state.logs.unshift(action.payload);
      })
      .addCase(upsertHealthLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchHealthLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchHealthLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchWeeklySummary.fulfilled, (state, action) => {
        state.weeklySummary = action.payload;
      })
      .addCase(fetchWeeklySummary.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(createMetric.fulfilled, (state, action) => {
        state.metrics.unshift(action.payload);
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(deleteMetric.fulfilled, (state, action) => {
        state.metrics = state.metrics.filter((m) => m.id !== action.payload);
      })
      .addCase(createMetric.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteMetric.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logMetricValue.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearHealthError } = healthSlice.actions;

// Selectors
export const selectHealthLogs = (state) => state.health.logs;
export const selectHealthMetrics = (state) => state.health.metrics;
export const selectWeeklySummary = (state) => state.health.weeklySummary;
export const selectHealthLoading = (state) => state.health.loading;
export const selectHealthError = (state) => state.health.error;

export default healthSlice.reducer;

