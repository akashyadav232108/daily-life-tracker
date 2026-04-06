import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './notificationAPI';

// ─── Async Thunks ────────────────────────────────────────────────

/** Fetch paginated notifications; page defaults to 0, size to 20 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = { page: 0, size: 20 }, { rejectWithValue }) => {
    try {
      const res = await api.fetchNotifications(params);
      return res.data; // Page<NotificationResponse>
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

/** Fetch unread badge count */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchUnreadCount();
      return res.data; // number
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

/** Mark a single notification as read */
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

/** Mark all notifications as read */
export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.markAllRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all read');
    }
  }
);

/** Delete a notification */
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

/** Fetch today's daily summary */
export const fetchTodaySummary = createAsyncThunk(
  'notifications/fetchTodaySummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchTodaySummary();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch daily summary');
    }
  }
);

/** Fetch user streaks */
export const fetchStreaks = createAsyncThunk(
  'notifications/fetchStreaks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchStreaks();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch streaks');
    }
  }
);

/** Fetch weekly summary */
export const fetchWeeklySummary = createAsyncThunk(
  'notifications/fetchWeeklySummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.fetchWeeklySummary();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weekly summary');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────

const initialState = {
  // Notifications list (paginated)
  notifications: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  unreadCount: 0,

  // Insights
  todaySummary: null,
  streaks: [],
  weeklySummary: null,

  loading: false,
  insightsLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    /** Optimistically decrement unread count when user opens the panel */
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Notifications ──
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const page = action.payload;
        if (page) {
          state.notifications = page.content || [];
          state.totalPages = page.totalPages || 0;
          state.totalElements = page.totalElements || 0;
          state.currentPage = page.number || 0;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Unread Count ──
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload || 0;
    });

    // ── Mark One Read ──
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((n) => n.id === id);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // ── Mark All Read ──
    builder.addCase(markAllRead.fulfilled, (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    });

    // ── Delete Notification ──
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((n) => n.id === id);
      if (n && !n.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.notifications = state.notifications.filter((n) => n.id !== id);
    });

    // ── Today Summary ──
    builder
      .addCase(fetchTodaySummary.pending, (state) => {
        state.insightsLoading = true;
      })
      .addCase(fetchTodaySummary.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.todaySummary = action.payload;
      })
      .addCase(fetchTodaySummary.rejected, (state) => {
        state.insightsLoading = false;
      });

    // ── Streaks ──
    builder
      .addCase(fetchStreaks.pending, (state) => {
        state.insightsLoading = true;
      })
      .addCase(fetchStreaks.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.streaks = action.payload;
      })
      .addCase(fetchStreaks.rejected, (state) => {
        state.insightsLoading = false;
      });

    // ── Weekly Summary ──
    builder.addCase(fetchWeeklySummary.fulfilled, (state, action) => {
      state.weeklySummary = action.payload;
    });
  },
});

export const { clearNotificationError, resetUnreadCount } = notificationSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────
export const selectNotifications    = (state) => state.notifications.notifications;
export const selectUnreadCount      = (state) => state.notifications.unreadCount;
export const selectTotalPages       = (state) => state.notifications.totalPages;
export const selectCurrentPage      = (state) => state.notifications.currentPage;
export const selectTodaySummary     = (state) => state.notifications.todaySummary;
export const selectStreaks           = (state) => state.notifications.streaks;
export const selectWeeklySummary    = (state) => state.notifications.weeklySummary;
export const selectNotifLoading     = (state) => state.notifications.loading;
export const selectInsightsLoading  = (state) => state.notifications.insightsLoading;
export const selectNotifError       = (state) => state.notifications.error;

export default notificationSlice.reducer;
