import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './expenseAPI';

// ─── Async Thunks ────────────────────────────────────────────────

/** Fetch expenses with optional filters: { from, to, type, category, view } */
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.fetchExpenses(params);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

/** Add a new expense or income */
export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.addExpense(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add expense');
    }
  }
);

/** Update an existing expense */
export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.updateExpense(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update expense');
    }
  }
);

/** Delete an expense */
export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteExpense(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete expense');
    }
  }
);

/** Fetch monthly income/expense summary */
export const fetchMonthlySummary = createAsyncThunk(
  'expenses/fetchMonthlySummary',
  async (monthYear, { rejectWithValue }) => {
    try {
      const res = await api.fetchMonthlySummary(monthYear);
      return res.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch monthly summary');
    }
  }
);

/** Create a budget for a category */
export const createBudget = createAsyncThunk(
  'expenses/createBudget',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.createBudget(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create budget');
    }
  }
);

/** Fetch budgets for a month */
export const fetchBudgets = createAsyncThunk(
  'expenses/fetchBudgets',
  async (monthYear, { rejectWithValue }) => {
    try {
      const res = await api.fetchBudgets(monthYear);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

/** Fetch budget status (spent vs limit) */
export const fetchBudgetStatus = createAsyncThunk(
  'expenses/fetchBudgetStatus',
  async (monthYear, { rejectWithValue }) => {
    try {
      const res = await api.fetchBudgetStatus(monthYear);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch budget status');
    }
  }
);

/** Update a budget's monthly limit */
export const updateBudget = createAsyncThunk(
  'expenses/updateBudget',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.updateBudget(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update budget');
    }
  }
);

/** Delete a budget */
export const deleteBudget = createAsyncThunk(
  'expenses/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteBudget(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete budget');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────

const initialState = {
  expenses: [],
  budgets: [],
  budgetStatus: [],
  monthlySummary: null,
  loading: false,
  error: null,

  // Active filters
  filters: {
    view: 'month',  // 'today' | 'week' | 'month' | ''
    type: '',       // '' | 'INCOME' | 'EXPENSE'
    category: '',   // '' | any Category enum value
  },
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    clearExpenseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Expenses ──
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Add Expense ──
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Update Expense ──
    builder
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.expenses[idx] = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Delete Expense ──
    builder
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Monthly Summary ──
    builder
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── Budgets ──
    builder
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.unshift(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.budgets[idx] = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
        state.budgetStatus = state.budgetStatus.filter((b) => b.budgetId !== action.payload);
      });

    // ── Budget Status ──
    builder
      .addCase(fetchBudgetStatus.fulfilled, (state, action) => {
        state.budgetStatus = action.payload;
      })
      .addCase(fetchBudgetStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearExpenseError } = expenseSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────
export const selectExpenses = (state) => state.expenses.expenses;
export const selectBudgets = (state) => state.expenses.budgets;
export const selectBudgetStatus = (state) => state.expenses.budgetStatus;
export const selectMonthlySummary = (state) => state.expenses.monthlySummary;
export const selectExpenseLoading = (state) => state.expenses.loading;
export const selectExpenseError = (state) => state.expenses.error;
export const selectExpenseFilters = (state) => state.expenses.filters;

// Computed: today's total spend
export const selectTodaySpend = (state) => {
  const today = new Date().toISOString().split('T')[0];
  return state.expenses.expenses
    .filter((e) => e.type === 'EXPENSE' && e.expenseDate === today)
    .reduce((sum, e) => sum + Number(e.amount), 0);
};

export default expenseSlice.reducer;
