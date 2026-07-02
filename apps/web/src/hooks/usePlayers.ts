import { useQuery } from "@tanstack/react-query";
import type { Player, PlayerFilters, PlayerResponse } from "../types/player";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

async function fetchPlayers(
  filters: Partial<PlayerFilters> & { page?: number; limit?: number },
): Promise<PlayerResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));

  if (filters.limit) params.set("limit", String(filters.limit));

  if (filters.search) params.set("search", String(filters.search));

  if (filters.team) params.set("team", String(filters.team));

  if (filters.position) params.set("position", String(filters.position));

  if (filters.conference) params.set("conference", String(filters.conference));

  if (filters.sortBy) params.set("sortBy", String(filters.sortBy));

  if (filters.season) params.set("season", String(filters.season));

  const res = await fetch(`${API_BASE}/players?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }

  return res.json();
}

export function usePlayers(
  filters: Partial<PlayerFilters> & { page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["players", filters],
    queryFn: () => fetchPlayers(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function getLatestStat(player: Player, season = 2025) {
  const seasonStats = player.player_stats
    .filter((s) => s.season === season)
    .sort((a, b) => b.ppg - a.ppg);

  if (seasonStats.length > 0) {
    return seasonStats[0];
  }

  return player.player_stats.sort((a, b) => b.season - a.season)[0] ?? null;
}
