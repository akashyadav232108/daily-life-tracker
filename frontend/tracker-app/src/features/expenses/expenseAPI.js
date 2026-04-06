import { expenseAxios } from '../../app/axiosInstance';

/**
 * Expense Service API — maps to ExpenseController, BudgetController & AdminExpenseController.
 *
 * Base URL: VITE_EXPENSE_SERVICE_URL (default http://localhost:8084)
 *
 * User endpoints:
 *   POST   /api/expenses                    — add expense/income
 *   GET    /api/expenses                    — list (with filters)
 *   GET    /api/expenses/:id                — get single
 *   PUT    /api/expenses/:id                — update
 *   DELETE /api/expenses/:id                — delete
 *   GET    /api/expenses/summary/monthly    — monthly breakdown
 *
 * Budget endpoints:
 *   POST   /api/budgets                     — set budget
 *   GET    /api/budgets                     — list budgets (by month)
 *   GET    /api/budgets/status              — spend vs limit status
 *   PUT    /api/budgets/:id                 — update limit
 *   DELETE /api/budgets/:id                 — delete budget
 *
 * Admin endpoints:
 *   GET    /api/expenses/admin/users/:userId         — any user's expenses
 *   GET    /api/expenses/admin/users/:userId/budgets — any user's budgets
 *   GET    /api/expenses/admin/stats                 — platform stats
 *   DELETE /api/expenses/admin/:expenseId            — delete any expense (SUPER_ADMIN)
 */

// ─── Expense APIs ─────────────────────────────────────────────────

/**
 * Fetch current user's expenses with optional filters.
 * @param {Object} params - { from, to, type, category, view }
 */
export const fetchExpenses = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await expenseAxios.get('/api/expenses', { params: cleanParams });
  return res.data; // { success, message, data: ExpenseResponse[] }
};

/**
 * Get a single expense by ID.
 */
export const fetchExpenseById = async (id) => {
  const res = await expenseAxios.get(`/api/expenses/${id}`);
  return res.data;
};

/**
 * Add a new expense or income entry.
 * @param {Object} data - { type, amount, category, description, paymentMethod, expenseDate }
 */
export const addExpense = async (data) => {
  const res = await expenseAxios.post('/api/expenses', data);
  return res.data;
};

/**
 * Update an existing expense entry.
 */
export const updateExpense = async (id, data) => {
  const res = await expenseAxios.put(`/api/expenses/${id}`, data);
  return res.data;
};

/**
 * Delete an expense entry.
 */
export const deleteExpense = async (id) => {
  const res = await expenseAxios.delete(`/api/expenses/${id}`);
  return res.data;
};

/**
 * Get monthly income/expense breakdown by category.
 * @param {string} monthYear - "YYYY-MM" format (optional, defaults to current month)
 */
export const fetchMonthlySummary = async (monthYear) => {
  const params = monthYear ? { monthYear } : {};
  const res = await expenseAxios.get('/api/expenses/summary/monthly', { params });
  return res.data; // { success, message, data: MonthlyBreakdownResponse }
};

// ─── Budget APIs ──────────────────────────────────────────────────

/**
 * Set a monthly budget for a category.
 * @param {Object} data - { category, monthlyLimit, monthYear? }
 */
export const createBudget = async (data) => {
  const res = await expenseAxios.post('/api/budgets', data);
  return res.data;
};

/**
 * Get own budgets for a month (defaults to current month).
 * @param {string} monthYear - "YYYY-MM" (optional)
 */
export const fetchBudgets = async (monthYear) => {
  const params = monthYear ? { monthYear } : {};
  const res = await expenseAxios.get('/api/budgets', { params });
  return res.data; // { success, message, data: BudgetResponse[] }
};

/**
 * Get budget status (spent vs limit) for current month.
 * @param {string} monthYear - "YYYY-MM" (optional)
 */
export const fetchBudgetStatus = async (monthYear) => {
  const params = monthYear ? { monthYear } : {};
  const res = await expenseAxios.get('/api/budgets/status', { params });
  return res.data; // { success, message, data: BudgetStatusResponse[] }
};

/**
 * Update the monthly limit of an existing budget.
 */
export const updateBudget = async (id, data) => {
  const res = await expenseAxios.put(`/api/budgets/${id}`, data);
  return res.data;
};

/**
 * Delete a budget.
 */
export const deleteBudget = async (id) => {
  const res = await expenseAxios.delete(`/api/budgets/${id}`);
  return res.data;
};

// ─── CSV Import API ───────────────────────────────────────────────

/**
 * Upload a CSV file to bulk-import expenses/income.
 * Sends as multipart/form-data with field name "file".
 *
 * @param {File} file - The CSV File object from an <input type="file">
 * @returns {Promise} API response: { success, message, data: CsvImportResponse }
 */
export const importExpensesFromCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await expenseAxios.post('/api/expenses/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ─── Admin APIs ───────────────────────────────────────────────────

export const adminFetchUserExpenses = async (userId) => {
  const res = await expenseAxios.get(`/api/expenses/admin/users/${userId}`);
  return res.data;
};

export const adminFetchUserBudgets = async (userId) => {
  const res = await expenseAxios.get(`/api/expenses/admin/users/${userId}/budgets`);
  return res.data;
};

export const adminFetchExpenseStats = async () => {
  const res = await expenseAxios.get('/api/expenses/admin/stats');
  return res.data;
};

export const adminDeleteExpense = async (expenseId) => {
  const res = await expenseAxios.delete(`/api/expenses/admin/${expenseId}`);
  return res.data;
};
