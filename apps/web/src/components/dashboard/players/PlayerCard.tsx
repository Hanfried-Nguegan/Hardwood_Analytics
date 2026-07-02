import { useState } from "react";
import type { Player } from "../../../types/player";
import { getLatestStat } from "../../../hooks/usePlayers";

interface Props {
  player: Player;
  rank: number;
  isSelected: boolean;
  isBookmarked: boolean;
  onCompare: (id: string) => void;
  onBookmark: (id: string) => void;
}

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank === 1
      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-[0_0_10px_rgba(250,204,21,0.4)]"
      : rank === 2
        ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
        : rank === 3
          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black"
          : "bg-[#1f2937] text-gray-300";

  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${style}`}
    >
      {rank}
    </div>
  );
}

export function PlayerCard({
  player,
  rank,
  isSelected,
  isBookmarked,
  onCompare,
  onBookmark,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const stat = getLatestStat(player);
  const team = player.nba_teams;

  // NBA CDN headshot URL
  const headshot = player.nba_id
    ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nba_id}.png`
    : null;

  return (
    <div
      className={`bg-[#111827] rounded-xl border p-4 relative flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer group ${
        isSelected ? "border-purple-500" : "border-[#1f2937] hover:border-gray-600"
      }`}
    >
      {/* Top row — rank + bookmark */}
      <div className="flex justify-between items-start mb-3">
        <RankBadge rank={rank} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(player.id);
          }}
          className="hover:scale-110 transition-transform"
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${
              isBookmarked ? "text-orange-500" : "text-gray-600 hover:text-gray-400"
            }`}
            style={{
              fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Player avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1f2937] flex-shrink-0 bg-[#0a0e1a]">
          {headshot && !imgError ? (
            <img
              src={headshot}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <span className="text-[10px] font-bold text-white">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-white text-xs leading-tight truncate">
            {player.name}
          </h3>
          <p className="text-[9px] text-gray-400 mt-0.5 truncate">
            {player.position ?? "—"} •{" "}
            {team?.abbreviation ?? "—"} •{" "}
          </p>
        </div>
      </div>

      {/* Main stat — PPG */}
      <div className="flex justify-between items-end mb-4">
        <span className="text-3xl font-black tracking-tight text-white">
          {stat?.ppg?.toFixed(1) ?? "—"}
        </span>
        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">
          PPG
        </span>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[
          { label: "RPG", value: stat?.rpg?.toFixed(1) },
          { label: "APG", value: stat?.apg?.toFixed(1) },
          { label: "TS%", value: stat?.ft_pct ? (stat.ft_pct * 100).toFixed(1) : null },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center bg-[#0a0e1a] rounded-lg py-1.5 border border-white/5"
          >
            <span className="text-[11px] font-bold text-gray-200">
              {value ?? "—"}
            </span>
            <span className="text-[8px] text-gray-500 uppercase font-semibold">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare(player.id);
          }}
          className={`py-2 rounded-lg border text-[10px] font-bold transition-colors ${
            isSelected
              ? "bg-purple-600/20 border-purple-500 text-purple-300"
              : "border-[#374151] text-gray-300 hover:bg-[#374151] hover:text-white"
          }`}
        >
          {isSelected ? "Selected" : "Compare"}
        </button>
        <button className="py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] font-bold hover:opacity-90 transition-opacity border border-orange-500 shadow-[0_2px_8px_rgba(234,88,12,0.3)]">
          Profile
        </button>
      </div>
    </div>
  );
}