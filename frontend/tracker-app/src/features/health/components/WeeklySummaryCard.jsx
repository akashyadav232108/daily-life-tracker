const WeeklySummaryCard = ({ summary }) => {
  if (!summary) {
    return (
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold">Weekly Summary</h2>
        <div className="text-gray-400">No data yet.</div>
      </div>
    );
  }

  const { weekStart, weekEnd, avgWaterGlasses, avgSleepHours, avgSteps, daysLogged, moodDistribution } = summary;

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-1 text-lg font-semibold">Weekly Summary</h2>
      <div className="mb-4 text-sm text-gray-500">{weekStart} - {weekEnd}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Avg Water (glasses)</span><span>{avgWaterGlasses}</span></div>
        <div className="flex justify-between"><span>Avg Sleep (hrs)</span><span>{avgSleepHours}</span></div>
        <div className="flex justify-between"><span>Avg Steps</span><span>{avgSteps}</span></div>
        <div className="flex justify-between"><span>Days Logged</span><span>{daysLogged}</span></div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">Mood</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          {moodDistribution && Object.entries(moodDistribution).map(([k, v]) => (
            <div key={k} className="flex justify-between"><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;

