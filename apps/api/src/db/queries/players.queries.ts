import {
  NormalizedPlayer,
  NormalizedStat,
  NormalizedTeam,
} from "../../types/nba.types";
import { supabase } from "../client";

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

  const { error } = await supabase
    .from("player_stats")
    .upsert(rows, { onConflict: "player_id, season" });

  if (error) {
    throw new Error(`upsertPlayerStats failed: ${error.message}`);
  }

  return rows.length;
}
