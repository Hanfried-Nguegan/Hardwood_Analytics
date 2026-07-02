import type { PlayerFilters } from "../../../types/player";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const CONFERENCES = ["East", "West"];
const SORT_OPTIONS = [
  { label: "PPG", value: "ppg" },
  { label: "RPG", value: "rpg" },
  { label: "APG", value: "apg" },
  { label: "Name", value: "name" },
] as const;

interface FilterProps {
  filters: Partial<PlayerFilters>;
  onFilterChange: (key: keyof PlayerFilters, value: string) => void;
  onReset: () => void;
}

export function Filters({ filters, onFilterChange, onReset }: FilterProps) {
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "ppg" && v !== 2024
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter button */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-white text-xs font-semibold hover:bg-[#1f2937] transition-colors">
        <span className="material-symbols-outlined text-[16px] text-gray-400">
          tune
        </span>
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div className="h-6 w-px bg-[#1f2937]" />

      {/* Position */}
      <select
        onChange={(e) => onFilterChange("position", e.target.value)}
        value={filters.position ?? ""}
        className="px-3 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-gray-300 text-xs focus:outline-none hover:bg-[#1f2937] transition-colors cursor-pointer"
      >
        <option value="">All Positions</option>
        {POSITIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Conference */}
      <select
        onChange={(e) => onFilterChange("conference", e.target.value)}
        value={filters.conference ?? ""}
        className="px-3 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-gray-300 text-xs focus:outline-none hover:bg-[#1f2937] transition-colors cursor-pointer"
      >
        <option value="">All Conferences</option>
        {CONFERENCES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        onChange={(e) =>
          onFilterChange("sortBy", e.target.value as PlayerFilters["sortBy"])
        }
        value={filters.sortBy ?? "ppg"}
        className="px-3 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-gray-300 text-xs focus:outline-none hover:bg-[#1f2937] transition-colors cursor-pointer ml-auto"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Sort by: {o.label}
          </option>
        ))}
      </select>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-orange-500 text-xs font-semibold hover:text-orange-400 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}