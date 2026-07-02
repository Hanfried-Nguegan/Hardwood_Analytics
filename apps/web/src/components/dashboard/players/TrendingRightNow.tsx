const TRENDING = [
  {
    label: "Top Scorers",
    name: "Luka",
    stat: "33.9",
    statLabel: "PPG",
    icon: "local_fire_department",
    iconColor: "text-orange-500",
  },
  {
    label: "Rising Stars",
    name: "Wemby",
    stat: "24.1",
    statLabel: "PPG",
    icon: "trending_up",
    iconColor: "text-blue-400",
  },
  {
    label: "Efficiency King",
    name: "Jokic",
    stat: "68.3",
    statLabel: "TS%",
    icon: "bolt",
    iconColor: "text-yellow-400",
  },
  {
    label: "Best Defenders",
    name: "Mobley",
    stat: "1.8",
    statLabel: "BLK PG",
    icon: "shield",
    iconColor: "text-red-400",
  },
];

export function TrendingRightNow() {
  return (
    <div className="flex-1 bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm text-white font-bold flex items-center gap-1.5">
          Trending Right Now
          <span className="text-lg leading-none">🔥</span>
        </h3>
        <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center font-medium gap-1">
          View All
          <span className="material-symbols-outlined text-[14px]">
            arrow_forward
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {TRENDING.map((t) => (
          <div key={t.label} className="flex flex-col gap-2">
            <span className="text-[9px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <span
                className={`material-symbols-outlined text-[12px] ${t.iconColor}`}
              >
                {t.icon}
              </span>
              {t.label}
            </span>

            <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1f2937] p-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#1f2937] border border-[#374151] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white">
                  {t.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs text-white font-bold truncate">
                  {t.name}
                </span>
                <span className="text-[10px] text-white font-bold">
                  {t.stat}{" "}
                  <span className="text-gray-500 font-normal">
                    {t.statLabel}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}