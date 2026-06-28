import { supabase } from "./../client";
import {
  GetPlayersOptions,
  NormalizedPlayer,
  NormalizedStat,
  NormalizedTeam,
  PlayerRow,
} from "../../types/nba.types";

export async function upsertTeams(
  teams: NormalizedTeam[],
): Promise<Map<string, string>> {
  if (teams.length === 0) {
    return new Map();
  }
  const { data, error } = await supabase
    .from("nba_teams")
    .upsert(teams, { onConflict: "abbreviation" })
    .select("id, abbreviation");

  if (error) {
    throw new Error(`upsertedTeams failed: ${error.message}`);
  }

  return new Map(data!.map((t) => [t.abbreviation, t.id as string]));
}

export async function upsertPlayers(
  players: NormalizedPlayer[],
  teamMap: Map<string, string>,
): Promise<Map<number, string>> {
  if (players.length === 0) {
    return new Map();
  }

  const rows = players.map((p) => ({
    name: p.name,
    nba_id: p.nba_id,
    team_id: teamMap.get(p.team_abbreviation) ?? null,
    position: p.position,
    height: p.height,
    weight: p.weight,
    image_url: p.image_url,
  }));

  const { data, error } = await supabase
    .from("players")
    .upsert(rows, { onConflict: "nba_id" })
    .select("id, nba_id");

  if (error) {
    throw new Error(`upsertPlayers failed: ${error.message}`);
  }

  return new Map(data!.map((p) => [p.nba_id as number, p.id as string]));
}

export async function upsertPlayerStats(
  stats: NormalizedStat[],
  playerMap: Map<number, string>,
): Promise<number> {
  if (stats.length === 0) {
    return 0;
  }

  const rows = stats
    .map((s) => {
      const player_id = playerMap.get(s.nba_player_id);

      if (!player_id) {
        return null;
      }

      return {
        player_id,
        season: s.season,
        team_abbreviation: s.team_abbreviation,
        ppg: s.ppg,
        rpg: s.rpg,
        apg: s.apg,
        spg: s.spg,
        bpg: s.bpg,
        fg_pct: s.fg_pct,
        three_pct: s.three_pct,
        ft_pct: s.ft_pct,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  if (rows.length === 0) {
    return 0;
  }

  const { error } = await supabase.from("player_stats").upsert(rows as any[], {
    onConflict: "player_id, season, team_abbreviation",
  });

  if (error) {
    throw new Error(`upsertPlayerStats failed: ${error.message}`);
  }

  return rows.length;
}

export async function getPlayers(
  options: GetPlayersOptions = {},
): Promise<{ data: PlayerRow[]; total: number }> {
  const {
    page = 1,
    limit = 24,
    search,
    team,
    position,
    conference,
    sortBy = "ppg",
    order = "desc",
    season = 2024,
  } = options;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("players").select(
    `
      id,
      name,
      nba_id,
      position,
      height,
      weight,
      image_url,
      team_id,
      nba_teams (
        id,
        name,
        abbreviation,
        conference,
        logo_url
      ),
      player_stats (
        season,
        team_abbreviation,
        ppg,
        rpg,
        apg,
        spg,
        bpg,
        fg_pct,
        three_pct,
        ft_pct
      )
    `,
    { count: "exact" },
  );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (position) {
    query = query.ilike("position", `%${position}%`);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`getPlayers failed: ${error.message}`);
  }

  let filtered = (data as unknown as PlayerRow[]) ?? [];

  if (team) {
    filtered = filtered.filter((p) => p.nba_teams?.abbreviation === team);
  }

  if (conference) {
    filtered = filtered.filter((p) => p.nba_teams?.conference === conference);
  }

  // Sort by season stat — find the most recent season stats per player
  filtered = filtered.sort((a, b) => {
    const aStat = a.player_stats
      .filter((s) => s.season === season || !season)
      .sort((x, y) => y.season - x.season)[0];
    const bStat = b.player_stats
      .filter((s) => s.season === season || !season)
      .sort((x, y) => y.season - x.season)[0];

    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    const aVal = aStat?.[sortBy] ?? 0;
    const bVal = bStat?.[sortBy] ?? 0;
    return order === "asc" ? aVal - bVal : bVal - aVal;
  });

  return { data: filtered, total: count ?? 0 };
}

export async function getPlayerById(id: string): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from("players")
    .select(
      `
      id,
      name,
      nba_id,
      position,
      height,
      weight,
      image_url,
      team_id,
      nba_teams (
        id,
        name,
        abbreviation,
        conference,
        logo_url
      ),
      player_stats (
        season,
        team_abbreviation,
        ppg,
        rpg,
        apg,
        spg,
        bpg,
        fg_pct,
        three_pct,
        ft_pct
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as unknown as PlayerRow;
}
