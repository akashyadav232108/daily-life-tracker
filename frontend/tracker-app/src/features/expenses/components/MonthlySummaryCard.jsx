import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '../../../utils/constants';

/**
 * Monthly summary card showing:
 * - Total Income, Total Expense, Net Savings stats
 * - Pie chart of expense breakdown by category
 *
 * Props:
 *   summary - MonthlyBreakdownResponse object
 *     { monthYear, totalIncome, totalExpense, netSavings, categoryBreakdown[] }
 */
const MonthlySummaryCard = ({ summary }) => {
  if (!summary) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Monthly Summary</h3>
        <div className="py-8 text-center text-gray-400 text-sm">No data yet for this month.</div>
      </div>
    );
  }

  const pieData = (summary.categoryBreakdown || [])
    .filter((c) => Number(c.amount) > 0)
    .map((c) => ({
      name: c.category,
      value: Number(c.amount),
      color: CATEGORY_COLORS[c.category] || '#94a3b8',
    }));

  const totalIncome = Number(summary.totalIncome ?? 0);
  const totalExpense = Number(summary.totalExpense ?? 0);
  const netSavings = Number(summary.netSavings ?? 0);

  const fmt = (n) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Monthly Summary</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {summary.monthYear}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStatCard
          label="Income"
          value={`₹${fmt(totalIncome)}`}
          color="text-green-600"
          bg="bg-green-50"
          icon="↑"
        />
        <SummaryStatCard
          label="Expense"
          value={`₹${fmt(totalExpense)}`}
          color="text-red-600"
          bg="bg-red-50"
          icon="↓"
        />
        <SummaryStatCard
          label="Savings"
          value={`₹${fmt(Math.abs(netSavings))}`}
          color={netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}
          bg={netSavings >= 0 ? 'bg-blue-50' : 'bg-red-50'}
          icon={netSavings >= 0 ? '💰' : '⚠️'}
        />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 ? (
        <>
          <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Expense Breakdown
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                  `${CATEGORY_EMOJI[name] || ''} ${name}`,
                ]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ zIndex: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Category breakdown list */}
          <div className="mt-4 space-y-2">
            {summary.categoryBreakdown
              .filter((c) => Number(c.amount) > 0)
              .sort((a, b) => Number(b.amount) - Number(a.amount))
              .map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#94a3b8' }}
                    />
                    <span className="text-gray-600">
                      {CATEGORY_EMOJI[c.category]} {c.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{c.percentage?.toFixed(1)}%</span>
                    <span className="font-medium text-gray-800">
                      ₹{Number(c.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <p className="mt-2 text-center text-sm text-gray-400">
          No expense entries this month yet.
        </p>
      )}
    </div>
  );
};

const SummaryStatCard = ({ label, value, color, bg, icon }) => (
  <div className={`rounded-lg ${bg} p-3 text-center`}>
    <p className="text-lg">{icon}</p>
    <p className={`mt-0.5 text-xs font-medium text-gray-500`}>{label}</p>
    <p className={`mt-0.5 text-sm font-bold ${color} leading-tight`}>{value}</p>
  </div>
);

export default MonthlySummaryCard;
