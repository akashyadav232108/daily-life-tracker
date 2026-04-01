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
