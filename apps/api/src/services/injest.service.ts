import {
  fetchAllPlayers,
  fetchPlayerCareerStats,
  fetchPlayerInfo,
  fetchTeaminfo,
} from "../lib/nba-client.js";
import {
  upsertTeams,
  upsertPlayers,
  upsertPlayerStats,
} from "../db/queries/players.queries.js";
import type {
  NBACommonPlayer,
  NBAPlayerCareerStat,
  NormalizedTeam,
  NormalizedPlayer,
  NormalizedStat,
  IngestOptions,
  IngestResult,
  NBATeamInfo,
} from "../types/nba.types.js";
import { getTeamLogoUrl } from "../lib/team-logos.js";
import { supabase } from "../db/client.js";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function parseSeason(seasonId: string): number {
  return parseInt(seasonId.split("-")[0], 10);
}

function buildImageUrl(nbaId: number): string {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
}

function normalizeTeam(
  raw: NBACommonPlayer,
  teamInfo: NBATeamInfo | undefined,
): NormalizedTeam {
  return {
    name: teamInfo
      ? `${teamInfo.TEAM_CITY} ${teamInfo.TEAM_NAME}`
      : raw.TEAM_CITY
        ? `${raw.TEAM_CITY} (${raw.TEAM_ABBREVIATION})`
        : raw.TEAM_ABBREVIATION,
    abbreviation: raw.TEAM_ABBREVIATION,
    conference: teamInfo?.TEAM_CONFERENCE ?? null,
    logo_url: getTeamLogoUrl(raw.TEAM_ABBREVIATION) || null,
  };
}

function normalizePlayer(raw: NBACommonPlayer): NormalizedPlayer {
  return {
    name: raw.DISPLAY_FIRST_LAST,
    nba_id: raw.PERSON_ID,
    team_abbreviation: raw.TEAM_ABBREVIATION,
    position: null,
    height: null,
    weight: null,
    image_url: buildImageUrl(raw.PERSON_ID),
  };
}

function normalizeStats(
  rawStats: NBAPlayerCareerStat[],
  nbaPlayerId: number,
): NormalizedStat[] {
  return rawStats
    .filter((s) => s.SEASON_ID && s.GP > 0)
    .map((s) => ({
      nba_player_id: nbaPlayerId,
      season: parseSeason(s.SEASON_ID),
      ppg: s.PTS ?? 0,
      rpg: s.REB ?? 0,
      apg: s.AST ?? 0,
      spg: s.STL ?? 0,
      bpg: s.BLK ?? 0,
      fg_pct: s.FG_PCT ?? 0,
      three_pct: s.FG3_PCT ?? 0,
      ft_pct: s.FT_PCT ?? 0,
    }));
}

export async function runPlayerIngestion(
  options: IngestOptions = {},
): Promise<IngestResult> {
  const { season = "2024-25", delayMs = 600 } = options;

  const startedAt = Date.now();
  const errors: string[] = [];
  let statsUpserted = 0;

  console.log(
    `[ingest] ━━━━━ Starting full ingestion for season ${season} ━━━━━`,
  );

  console.log(`[ingest] Step 1/4: Fetching active players from NBA.com...`);

  // fetch all players

  const rawPlayers = await fetchAllPlayers(season);
  const activePlayers = rawPlayers.filter(
    (p) =>
      p.GAMES_PLAYED_FLAG === "Y" && // played at least one NBA game ever
      p.PERSON_ID > 0, // valid player ID
  );
  console.log(`[ingest] Found ${activePlayers.length} active players`);

  console.log(`[ingest] Step 2/4: Fetching team info and upserting teams...`);

  // isoloting players who have a current team
  const playersWithTeams = activePlayers.filter(
    (p) => p.TEAM_ABBREVIATION && p.TEAM_ABBREVIATION !== "",
  );

  // deduplicate - omly one entry per team abbreviation
  const uniqueTeamPlayer = playersWithTeams.filter(
    (p, i, arr) =>
      arr.findIndex((x) => x.TEAM_ABBREVIATION === p.TEAM_ABBREVIATION) === i,
  );

  // fetch team info for each unique team and store in a Map
  // Map<abbreviation, NBATeamInfo> — e.g. "LAL" → { TEAM_CONFERENCE: "West", ... }

  const teamInfoMap = new Map<string, NBATeamInfo>();
  for (const player of uniqueTeamPlayer) {
    const info = await fetchTeaminfo(player.TEAM_ID);

    if (info) {
      teamInfoMap.set(player.TEAM_ABBREVIATION, info);
      await delay(300);
    }
  }

  const uniqueTeams: NormalizedTeam[] = [
    ...new Map(
      playersWithTeams.map((p) => [
        p.TEAM_ABBREVIATION,
        normalizeTeam(p, teamInfoMap.get(p.TEAM_ABBREVIATION)),
      ]),
    ).values(),
  ];

  const teamMap = await upsertTeams(uniqueTeams);
  console.log(`[ingest] Upserted ${teamMap.size} teams`);

  console.log(
    `[ingest] Step 3/4: Upserting ${activePlayers.length} players...`,
  );
  const normalizedPlayers = activePlayers.map(normalizePlayer);
  const playerMap = await upsertPlayers(normalizedPlayers, teamMap);
  console.log(`[ingest] Upserted ${playerMap.size} players`);

  console.log(
    `[ingest] Step 4/4: Fetching career stats + info for ALL ${activePlayers.length} players...`,
  );
  console.log(
    `[ingest] Estimated time: ~${Math.ceil((activePlayers.length * delayMs) / 60000)} minutes`,
  );

  for (let i = 0; i < activePlayers.length; i++) {
    const player = activePlayers[i];
    const progress = `(${i + 1}/${activePlayers.length})`;

    try {
      const [rawStats, playerInfo] = await Promise.all([
        fetchPlayerCareerStats(player.PERSON_ID),
        fetchPlayerInfo(player.PERSON_ID),
      ]);
      //const rawStats = await fetchPlayerCareerStats(player.PERSON_ID);
      const stats = normalizeStats(rawStats, player.PERSON_ID);
      const count = await upsertPlayerStats(stats, playerMap);
      statsUpserted += count;

      if (playerInfo) {
        const playerId = playerMap.get(player.PERSON_ID);
        if (playerId) {
          await supabase
            .from("players")
            .update({
              position: playerInfo.POSITION || null,
              height: playerInfo.HEIGHT || null,
              weight: playerInfo.WEIGHT
                ? parseInt(playerInfo.WEIGHT, 10)
                : null,
            })
            .eq("id", playerId);
        }
      }

      console.log(
        `[ingest] ${progress} ✓ ${player.DISPLAY_FIRST_LAST} — ${count} seasons | ${playerInfo?.POSITION ?? "no pos"} | ${playerInfo?.HEIGHT ?? "no height"}`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorMsg = `${progress} ✗ ${player.DISPLAY_FIRST_LAST} (ID: ${player.PERSON_ID}): ${message}`;

      console.warn(`[ingest] ${errorMsg}`);
      errors.push(errorMsg);
    }

    await delay(delayMs);
  }

  const result: IngestResult = {
    teamsUpserted: teamMap.size,
    playersUpserted: playerMap.size,
    statsUpserted,
    errors,
    durationMs: Date.now() - startedAt,
  };

  console.log(
    `[ingest] ━━━━━ Complete in ${(result.durationMs / 1000).toFixed(1)}s ━━━━━`,
  );
  console.log(
    `[ingest] Players: ${result.playersUpserted} | Stats: ${result.statsUpserted} | Errors: ${result.errors.length}`,
  );

  return result;
}
