/**
 * Format a date string to a readable format
 * @param {string} dateStr - ISO date string (YYYY-MM-DD or full ISO)
 * @returns {string} Formatted date like "Mar 28, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a datetime string to a readable format
 * @param {string} dateStr - ISO datetime string
 * @returns {string} Formatted datetime like "Mar 28, 2026 10:30 AM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export const isToday = (dateStr) => {
  if (!dateStr) return false;
  return dateStr.split('T')[0] === getTodayISO();
};

/**
 * Check if a date is overdue (past due date and not completed)
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  const dueDate = new Date(dateStr.split('T')[0]);
  const today = new Date(getTodayISO());
  return dueDate < today;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {string} dateStr - ISO datetime string
 * @returns {string}
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'just now';
};
