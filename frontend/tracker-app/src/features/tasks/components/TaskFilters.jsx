import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters, selectFilters } from '../taskSlice';
import {
  VIEW_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from '../../../utils/constants';
import { HiAdjustmentsHorizontal, HiArrowPath } from 'react-icons/hi2';

/**
 * Filter bar for the Tasks page.
 * Syncs with Redux filters → triggers re-fetch in the parent page via useEffect.
 */
const TaskFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const handleChange = (key, value) => {
    // When a "view" shortcut is selected, clear manual date range and vice versa
    if (key === 'view') {
      dispatch(setFilters({ view: value, date: '', from: '', to: '' }));
    } else if (key === 'from' || key === 'to' || key === 'date') {
      dispatch(setFilters({ [key]: value, view: '' }));
    } else {
      dispatch(setFilters({ [key]: value }));
    }
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  // Check if any filter is active (different from default)
  const hasActiveFilters =
    filters.status !== '' ||
    filters.priority !== '' ||
    filters.view !== 'today' ||
    filters.date !== '' ||
    filters.from !== '' ||
    filters.to !== '';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <HiAdjustmentsHorizontal className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium
                       text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <HiArrowPath className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* View shortcuts (Today / Week / Month) */}
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          {/* "All" option */}
          <button
            onClick={() => handleChange('view', '')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                        ${filters.view === '' && !filters.date && !filters.from
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All
          </button>
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('view', opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                          ${filters.view === opt.value
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs shadow-sm
                       focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs shadow-sm
                       focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range (shown when no view shortcut is selected) */}
        {filters.view === '' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleChange('from', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs shadow-sm
                           focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleChange('to', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs shadow-sm
                           focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
