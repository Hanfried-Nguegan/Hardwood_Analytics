import type { Player } from "../../../types/player";

interface Props {
  selectedIds: string[];
  players: Player[];
  onClear: () => void;
}

export function FloatingCompareBar({ selectedIds, players, onClear }: Props) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111827] border border-[#1f2937] rounded-full pl-3 pr-2 py-2 flex items-center gap-6 shadow-2xl z-50">
      {/* Selected player avatars + count */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {selectedIds.map((id) => {
            const p = players.find((pl) => pl.id === id);
            return (
              <div
                key={id}
                className="w-9 h-9 rounded-full bg-[#1f2937] border-2 border-[#111827] overflow-hidden"
              >
                {p?.nba_id ? (
                  <img
                    src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${p.nba_id}.png`}
                    alt={p.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">
                      {p?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-sm font-semibold text-white">
          {selectedIds.length} Players Selected
        </span>
      </div>

      {/* Compare button */}
      <button className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:opacity-90 transition-opacity">
        Compare Players
        <span className="material-symbols-outlined text-[16px]">
          arrow_forward
        </span>
      </button>

      {/* Dismiss */}
      <button
        onClick={onClear}
        className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">
          keyboard_arrow_down
        </span>
      </button>
    </div>
  );
}