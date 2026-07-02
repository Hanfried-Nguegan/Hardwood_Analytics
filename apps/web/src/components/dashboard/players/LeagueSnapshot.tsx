const SNAPSHOT_STATS = [
  { label: "Players", value: "572", icon: "groups" },
  { label: "Avg PPG", value: "17.6", icon: "sports_basketball" },
  { label: "Avg RPG", value: "6.4", icon: "leaderboard" },
  { label: "Avg APG", value: "4.9", icon: "trending_up" },
  { label: "Avg PER", value: "18.2", icon: "analytics" },
  { label: "Avg TS%", value: "58.6%", icon: "bolt" },
];

export function LeagueSnapshot() {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-white">League Snapshot</h3>
        <span className="material-symbols-outlined text-gray-500 text-[16px]">
          info
        </span>
      </div>

      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
        {SNAPSHOT_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111827] border border-[#1f2937] p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#1f2937]/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-400 text-[20px]">
                {stat.icon}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white leading-none">
                {stat.value}
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}