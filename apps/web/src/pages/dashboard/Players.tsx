import { useState } from "react";
import { usePlayers } from "../../hooks/usePlayers";
import type { PlayerFilters } from "../../types/player";
import { PlayerHero } from "../../components/dashboard/players/PlayerHero";
import { PlayerCard } from "../../components/dashboard/players/PlayerCard";
import { Filters } from "../../components/dashboard/players/Filters";
import { LeagueSnapshot } from "../../components/dashboard/players/LeagueSnapshot";
import { TrendingRightNow } from "../../components/dashboard/players/TrendingRightNow";
import { FloatingCompareBar } from "../../components/dashboard/players/FloatingCompareBar";

export function Players() {
  const [filters, setFilters] = useState<Partial<PlayerFilters>>({
    sortBy: "ppg",
    season: 2024,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const { data, isLoading, isFetching } = usePlayers({
    ...filters,
    search: search || undefined,
    page,
    limit: 12,
  });

  const players = data?.data ?? [];
  const pagination = data?.pagination;
  const heroPlayer = players[0] ?? null;

  const toggleCompare = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (key: keyof PlayerFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ sortBy: "ppg", season: 2024 });
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-24">

      {/* Page header + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Player Explorer
            <span className="material-symbols-outlined text-purple-400 text-[22px]">
              auto_awesome
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Explore {pagination?.total ?? "500+"} NBA players with deep real-time analytics
          </p>
        </div>

        <div className="relative w-full md:w-[400px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search players, teams, stats..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#111827] border border-[#1f2937] rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Hero — top ranked player */}
      {heroPlayer && !isLoading && <PlayerHero player={heroPlayer} />}

      {/* Filter bar */}
      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* League snapshot + trending */}
      <div className="flex flex-col lg:flex-row gap-6">
        <LeagueSnapshot />
        <TrendingRightNow />
      </div>

      {/* Results count + view toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-300">
          {isLoading
            ? "Loading..."
            : `${pagination?.total ?? 0} Players Found`}
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1f2937] text-white">
            <span className="material-symbols-outlined text-[16px] text-orange-500">
              grid_view
            </span>
            Grid View
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[16px]">
              view_list
            </span>
            List View
          </button>
        </div>
      </div>

      {/* Player grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111827] rounded-xl border border-[#1f2937] h-64 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {players.map((player, i) => (
            <PlayerCard
              key={player.id}
              player={player}
              rank={(page - 1) * 12 + i + 1}
              isSelected={selectedPlayers.includes(player.id)}
              isBookmarked={bookmarked.includes(player.id)}
              onCompare={toggleCompare}
              onBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-[#1f2937] transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-xs text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg border border-[#1f2937] bg-[#111827] text-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-[#1f2937] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Floating compare bar */}
      <FloatingCompareBar
        selectedIds={selectedPlayers}
        players={players}
        onClear={() => setSelectedPlayers([])}
      />
    </div>
  );
}