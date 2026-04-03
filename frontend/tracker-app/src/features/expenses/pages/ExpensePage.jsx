import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenses,
  fetchBudgets,
  fetchBudgetStatus,
  fetchMonthlySummary,
  setFilters,
  resetFilters,
  clearExpenseError,
  selectExpenses,
  selectBudgets,
  selectBudgetStatus,
  selectMonthlySummary,
  selectExpenseLoading,
  selectExpenseError,
  selectExpenseFilters,
} from '../expenseSlice';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BudgetForm from '../components/BudgetForm';
import BudgetProgress from '../components/BudgetProgress';
import MonthlySummaryCard from '../components/MonthlySummaryCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {
  TRANSACTION_TYPES,
  EXPENSE_CATEGORIES,
} from '../../../utils/constants';
import { HiPlus, HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

// Derive current month in "YYYY-MM" format
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const ExpensePage = () => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectExpenses);
  const budgets = useSelector(selectBudgets);
  const budgetStatus = useSelector(selectBudgetStatus);
  const monthlySummary = useSelector(selectMonthlySummary);
  const loading = useSelector(selectExpenseLoading);
  const error = useSelector(selectExpenseError);
  const filters = useSelector(selectExpenseFilters);

  const [currentMonth] = useState(getCurrentMonth);

  // Modal states
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Active tab for the right panel: 'budget' | 'summary'
  const [rightTab, setRightTab] = useState('budget');

  // ── Load data ──────────────────────────────────────────────────
  const loadData = useCallback(() => {
    dispatch(fetchExpenses(filters));
    dispatch(fetchBudgets(currentMonth));
    dispatch(fetchBudgetStatus(currentMonth));
    dispatch(fetchMonthlySummary(currentMonth));
  }, [dispatch, filters, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExpenseError());
    }
  }, [error, dispatch]);

  // ── Handlers ──────────────────────────────────────────────────
  const openCreateExpense = () => {
    setEditingExpense(null);
    setIsExpenseFormOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const closeExpenseForm = () => {
    setIsExpenseFormOpen(false);
    setEditingExpense(null);
    // Reload expenses + summary after create/update
    dispatch(fetchExpenses(filters));
    dispatch(fetchMonthlySummary(currentMonth));
    dispatch(fetchBudgetStatus(currentMonth));
  };

  const openCreateBudget = () => {
    setEditingBudget(null);
    setIsBudgetFormOpen(true);
  };

  const openEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsBudgetFormOpen(true);
  };

  const closeBudgetForm = () => {
    setIsBudgetFormOpen(false);
    setEditingBudget(null);
    dispatch(fetchBudgets(currentMonth));
    dispatch(fetchBudgetStatus(currentMonth));
  };

  // ── Computed totals from expenses array (quick stats) ─────────
  const totalExpenseThisMonth = expenses
    .filter((e) => e.type === 'EXPENSE' && e.expenseDate?.startsWith(currentMonth))
    .reduce((s, e) => s + Number(e.amount), 0);

  const totalIncomeThisMonth = expenses
    .filter((e) => e.type === 'INCOME' && e.expenseDate?.startsWith(currentMonth))
    .reduce((s, e) => s + Number(e.amount), 0);

  const fmt = (n) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Track your income and expenses, set budgets</p>
        </div>
        <button
          onClick={openCreateExpense}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium
                     text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          <HiPlus className="h-4 w-4" />
          Add Entry
        </button>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Income (this month)"
          value={`₹${fmt(totalIncomeThisMonth)}`}
          color="bg-green-50 text-green-700"
          icon="↑"
        />
        <StatCard
          label="Expenses (this month)"
          value={`₹${fmt(totalExpenseThisMonth)}`}
          color="bg-red-50 text-red-700"
          icon="↓"
        />
        <StatCard
          label="Net Savings"
          value={`₹${fmt(Math.abs(totalIncomeThisMonth - totalExpenseThisMonth))}`}
          color={
            totalIncomeThisMonth >= totalExpenseThisMonth
              ? 'bg-blue-50 text-blue-700'
              : 'bg-orange-50 text-orange-700'
          }
          icon={totalIncomeThisMonth >= totalExpenseThisMonth ? '💰' : '⚠️'}
        />
      </div>

      {/* ── Filters ── */}
      <ExpenseFilters filters={filters} dispatch={dispatch} />

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left — expense list */}
        <div className="xl:col-span-2">
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : (
            <ExpenseList
              expenses={expenses}
              onEdit={openEditExpense}
              loading={loading}
              onAddClick={openCreateExpense}
            />
          )}
        </div>

        {/* Right — budget + summary */}
        <div className="space-y-0">
          {/* Tab switcher */}
          <div className="mb-3 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <TabBtn
              active={rightTab === 'budget'}
              onClick={() => setRightTab('budget')}
              label="Budget"
            />
            <TabBtn
              active={rightTab === 'summary'}
              onClick={() => setRightTab('summary')}
              label="Summary"
            />
          </div>

          {rightTab === 'budget' ? (
            <BudgetProgress
              budgetStatus={budgetStatus}
              budgets={budgets}
              onAddBudget={openCreateBudget}
              onEditBudget={openEditBudget}
            />
          ) : (
            <MonthlySummaryCard summary={monthlySummary} />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={closeExpenseForm}
        editingExpense={editingExpense}
      />

      <BudgetForm
        isOpen={isBudgetFormOpen}
        onClose={closeBudgetForm}
        editingBudget={editingBudget}
        currentMonth={currentMonth}
      />
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

const StatCard = ({ label, value, color, icon }) => (
  <div className={`rounded-xl p-4 ${color} col-span-1`}>
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <p className="text-xs font-medium opacity-75">{label}</p>
    </div>
    <p className="mt-1 text-lg font-bold leading-tight">{value}</p>
  </div>
);

const TabBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

// ─── Filters bar ─────────────────────────────────────────────────

const VIEW_OPTS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const ExpenseFilters = ({ filters, dispatch }) => {
  const hasActiveFilters = filters.type !== '' || filters.category !== '' || filters.view !== 'month';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View */}
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        {VIEW_OPTS.map((v) => (
          <button
            key={v.value}
            onClick={() => dispatch(setFilters({ view: v.value }))}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.view === v.value
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <select
        value={filters.type}
        onChange={(e) => dispatch(setFilters({ type: e.target.value }))}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm focus:outline-none"
      >
        <option value="">All Types</option>
        {TRANSACTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Category filter */}
      <select
        value={filters.category}
        onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm focus:outline-none"
      >
        <option value="">All Categories</option>
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => dispatch(resetFilters())}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
        >
          <HiXMark className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
};

export default ExpensePage;
