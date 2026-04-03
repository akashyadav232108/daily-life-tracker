// Priority colors for task cards
export const PRIORITY_COLORS = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500', border: 'border-red-500' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500', border: 'border-yellow-500' },
  LOW: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500', border: 'border-green-500' },
};

// Status labels
export const STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

// Recurrence type labels
export const RECURRENCE_LABELS = {
  NONE: 'One-time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

// View options for task filtering
export const VIEW_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

// Priority options
export const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

// Status filter options
export const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
];

// Recurrence options for task form
export const RECURRENCE_OPTIONS = [
  { value: 'NONE', label: 'One-time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

// Roles
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// ─── Expense / Budget Constants ──────────────────────────────────

export const TRANSACTION_TYPES = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'FOOD', label: '🍔 Food' },
  { value: 'TRANSPORT', label: '🚗 Transport' },
  { value: 'RENT', label: '🏠 Rent' },
  { value: 'UTILITIES', label: '💡 Utilities' },
  { value: 'ENTERTAINMENT', label: '🎬 Entertainment' },
  { value: 'SHOPPING', label: '🛍️ Shopping' },
  { value: 'HEALTH', label: '🏥 Health' },
  { value: 'EDUCATION', label: '📚 Education' },
  { value: 'SUBSCRIPTIONS', label: '📱 Subscriptions' },
  { value: 'SALARY', label: '💰 Salary' },
  { value: 'FREELANCE', label: '💻 Freelance' },
  { value: 'OTHER', label: '📦 Other' },
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

// Category emoji map (for quick lookup)
export const CATEGORY_EMOJI = {
  FOOD: '🍔',
  TRANSPORT: '🚗',
  RENT: '🏠',
  UTILITIES: '💡',
  ENTERTAINMENT: '🎬',
  SHOPPING: '🛍️',
  HEALTH: '🏥',
  EDUCATION: '📚',
  SUBSCRIPTIONS: '📱',
  SALARY: '💰',
  FREELANCE: '💻',
  OTHER: '📦',
};

// Colors for pie chart — one per category
export const CATEGORY_COLORS = {
  FOOD: '#f97316',
  TRANSPORT: '#3b82f6',
  RENT: '#8b5cf6',
  UTILITIES: '#eab308',
  ENTERTAINMENT: '#ec4899',
  SHOPPING: '#14b8a6',
  HEALTH: '#22c55e',
  EDUCATION: '#6366f1',
  SUBSCRIPTIONS: '#f43f5e',
  SALARY: '#10b981',
  FREELANCE: '#0ea5e9',
  OTHER: '#94a3b8',
};