import { useState } from "react";
import { getLatestStat } from "../../../hooks/usePlayers";
import type { Player } from "../../../types/player";

interface Props {
  player: Player;
}

export function PlayerHero({ player }: Props) {
  const [imgError, setImgError] = useState(false);
  const stat = getLatestStat(player);
  const team = player.nba_teams;

  const headshot = player.nba_id
    ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nba_id}.png`
    : null;

  const firstName = player.name.split(" ")[0];
  const lastName = player.name.split(" ").slice(1).join(" ");

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#07112c] via-[#0a0f24] to-[#040812] border border-[#1f2937] overflow-hidden p-6 md:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center shadow-2xl min-h-[280px] md:min-h-[320px]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <path d="M-100,150 C200,300 400,0 600,150 C800,300 1100,50 1100,50" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <path d="M-100,200 C300,50 500,300 800,100 C1000,0 1200,200 1200,200" fill="none" stroke="#8b5cf6" strokeWidth="3" />
        </svg>
      </div>

      {/* Player headshot — large, positioned right */}
      {headshot && !imgError && (
        <div className="absolute bottom-0 right-[30%] xl:right-[35%] h-full pointer-events-none hidden xl:block">
          <img
            src={headshot}
            alt={player.name}
            className="h-full w-auto object-contain object-bottom opacity-90 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Left content */}
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex flex-col">
          <span className="text-lg text-blue-400/80 font-bold uppercase tracking-[0.2em] mb-1">
            {firstName}
          </span>
          <div className="flex items-end gap-3 flex-wrap">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl">
              {lastName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {team?.logo_url && (
            <img src={team.logo_url} alt={team.name} className="w-6 h-6 object-contain" />
          )}
          <span className="text-white font-semibold text-sm">{team?.name ?? "—"}</span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-300 text-xs">{player.position ?? "—"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-300 font-medium">
          {player.height && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-gray-400">height</span>
              {player.height}
            </span>
          )}
          {player.weight && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-gray-400">monitor_weight</span>
              {player.weight} lbs
            </span>
          )}
        </div>

        <button className="w-max mt-1 px-6 py-2.5 rounded-full border border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 text-purple-200 font-semibold text-sm hover:from-purple-900/60 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          View Full Profile
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Right — stats panel */}
      <div className="relative z-10 flex flex-col gap-4 w-full xl:w-auto mt-8 xl:mt-0 bg-[#0a0e1a]/50 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
        {/* Season selector */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-xs text-gray-300 font-medium cursor-pointer">
            2024-25 Season
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-4 gap-6 border-b border-gray-800 pb-4">
          {[
            { label: "PPG", value: stat?.ppg?.toFixed(1) },
            { label: "RPG", value: stat?.rpg?.toFixed(1) },
            { label: "APG", value: stat?.apg?.toFixed(1) },
            { label: "TS%", value: stat?.ft_pct ? (stat.ft_pct * 100).toFixed(1) : null },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-3xl font-bold text-white">{value ?? "—"}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-gray-400 font-medium text-[11px]">Last 10 Games</span>
            <span className="text-green-400 font-bold flex items-center gap-1 bg-green-900/20 border border-green-900/50 px-1.5 py-0.5 rounded text-[10px]">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              12.4%
            </span>
          </div>
          <svg className="w-full h-10" viewBox="0 0 300 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              d="M0,25 Q15,15 30,28 T60,20 T90,32 T120,15 T150,22 T180,8 T210,18 T240,5 T270,15 T300,10"
              fill="none"
              stroke="url(#sparkGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="300" cy="10" r="4" fill="#8b5cf6" stroke="#fff" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-1">
          <button className="px-5 py-2.5 rounded-full border border-purple-500 text-purple-400 font-semibold text-xs hover:bg-purple-500/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
            Compare
          </button>
          <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            AI Report
          </button>
          <button className="w-10 h-10 rounded-full border border-orange-500/50 flex items-center justify-center text-orange-500 hover:bg-orange-500/10 transition-colors">
            <span className="material-symbols-outlined text-[16px]">favorite</span>
          </button>
        </div>
      </div>
    </div>
  );
}