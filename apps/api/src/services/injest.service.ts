
import { fetchAllPlayers, fetchPlayerCareerStats } from "../lib/nba-client.js";
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
} from "../types/nba.types.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Rate limit pause between stat requests.
// NBA.com allows roughly 1 request/second. 600ms gives a safety buffer.
// This is a background job — it doesn't need to be fast, it needs to be reliable.
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// NBA.com returns season as "2024-25" — your DB stores it as 2024 (integer)
// parseInt("2024-25".split("-")[0], 10) → 2024
function parseSeason(seasonId: string): number {
  return parseInt(seasonId.split("-")[0], 10);
}

// NBA.com serves player headshots at a predictable CDN URL.
// You get image_url for free without any extra API call.
function buildImageUrl(nbaId: number): string {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
}

// ─── NORMALIZATION FUNCTIONS ───────────────────────────────────────────────────
// Pure functions — no side effects, no I/O.
// Input: external API shape. Output: your DB shape.
// Easy to unit test in isolation.

function normalizeTeam(raw: NBACommonPlayer): NormalizedTeam {
  return {
    // TEAM_CITY = "Denver", TEAM_ABBREVIATION = "DEN"
    // This gives us "Denver DEN" which is placeholder — enriched later
    // A future checkpoint calls teamdetails endpoint for proper full names
    name: raw.TEAM_CITY
      ? `${raw.TEAM_CITY} (${raw.TEAM_ABBREVIATION})`
      : raw.TEAM_ABBREVIATION,
    abbreviation: raw.TEAM_ABBREVIATION,
    conference: null, // enriched in Phase 2
  };
}

function normalizePlayer(raw: NBACommonPlayer): NormalizedPlayer {
  return {
    name: raw.DISPLAY_FIRST_LAST,
    nba_id: raw.PERSON_ID,
    team_abbreviation: raw.TEAM_ABBREVIATION,
    position: null,           // not in commonallplayers — Checkpoint 1.3
    image_url: buildImageUrl(raw.PERSON_ID),
  };
}

function normalizeStats(
  rawStats: NBAPlayerCareerStat[],
  nbaPlayerId: number
): NormalizedStat[] {
  return rawStats
    // Skip seasons where the player didn't actually play
    // GP = 0 means they were on the roster but played no games
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

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────

export async function runPlayerIngestion(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const {
    season = "2024-25",
    delayMs = 600,
  } = options;

  const startedAt = Date.now();
  const errors: string[] = [];
  let statsUpserted = 0;

  console.log(`[ingest] ━━━━━ Starting full ingestion for season ${season} ━━━━━`);

  // ── STEP 1: Fetch all active players from NBA.com ──────────────────────────
  // This is one HTTP call that returns ~500 players.
  // We filter ROSTERSTATUS === 1 to get only currently active players.
  console.log(`[ingest] Step 1/4: Fetching active players from NBA.com...`);

  // Argument of type 'string' is not assignable to parameter of type '"2024-25"'.ts(2345)
  // fix: either widen the season parameter type to string or change the default value to "2024-25"
  //fixed code: changed the season parameter type to string to allow for more flexibility in specifying different seasons in the future without having to update the type definition every time.
  
  const rawPlayers = await fetchAllPlayers(season);
  const activePlayers = rawPlayers.filter((p) => p.ROSTERSTATUS === 1);
  console.log(`[ingest] Found ${activePlayers.length} active players`);

  // ── STEP 2: Upsert teams FIRST (FK constraint) ─────────────────────────────
  // Players reference teams via team_id.
  // If we insert players before teams exist, Supabase throws a FK violation.
  // Deduplicate teams using Map — multiple players share the same team.
  console.log(`[ingest] Step 2/4: Upserting teams...`);
  const uniqueTeamsMap = new Map(
    activePlayers
      .filter((p) => p.TEAM_ABBREVIATION) // filter out free agents with no team
      .map((p) => [p.TEAM_ABBREVIATION, normalizeTeam(p)])
  );
  const uniqueTeams: NormalizedTeam[] = [...uniqueTeamsMap.values()];
  const teamMap = await upsertTeams(uniqueTeams);
  console.log(`[ingest] Upserted ${teamMap.size} teams`);

  // ── STEP 3: Upsert all players ─────────────────────────────────────────────
  // Now that teams exist, players can safely reference them.
  console.log(`[ingest] Step 3/4: Upserting ${activePlayers.length} players...`);
  const normalizedPlayers = activePlayers.map(normalizePlayer);
  const playerMap = await upsertPlayers(normalizedPlayers, teamMap);
  console.log(`[ingest] Upserted ${playerMap.size} players`);

  // ── STEP 4: Fetch + upsert career stats for EVERY player ──────────────────
  // This is the slow part: one HTTP call per player, with a delay between each.
  // ~500 players × 600ms delay = ~5 minutes minimum.
  //
  // WHY A for...of LOOP AND NOT Promise.all?
  // Promise.all fires all 500 requests simultaneously.
  // NBA.com will rate-limit or temporarily ban you.
  // The serial loop with delay is the correct approach for rate-limited APIs.
  //
  // WHY try/catch INSIDE THE LOOP?
  // If one player fails (timeout, 404, bad data), we catch it, log it,
  // and CONTINUE to the next player. One failure ≠ abort everything.
  // This is the difference between 490 successful players and 0.
  console.log(`[ingest] Step 4/4: Fetching career stats for ALL ${activePlayers.length} players...`);
  console.log(`[ingest] Estimated time: ~${Math.ceil((activePlayers.length * delayMs) / 60000)} minutes`);

  for (let i = 0; i < activePlayers.length; i++) {
    const player = activePlayers[i];
    const progress = `(${i + 1}/${activePlayers.length})`;

    try {
      const rawStats = await fetchPlayerCareerStats(player.PERSON_ID);
      const stats = normalizeStats(rawStats, player.PERSON_ID);
      const count = await upsertPlayerStats(stats, playerMap);
      statsUpserted += count;

      console.log(
        `[ingest] ${progress} ✓ ${player.DISPLAY_FIRST_LAST} — ${count} season rows`
      );
    } catch (err: unknown) {
      // Collect the error but DON'T re-throw — keep the loop going
      const message = err instanceof Error ? err.message : String(err);
      const errorMsg =
        `${progress} ✗ ${player.DISPLAY_FIRST_LAST} (ID: ${player.PERSON_ID}): ${message}`;

      console.warn(`[ingest] ${errorMsg}`);
      errors.push(errorMsg);
    }

    // Pause before next request — respect NBA.com's rate limit
    await delay(delayMs);
  }

  const result: IngestResult = {
    teamsUpserted: teamMap.size,
    playersUpserted: playerMap.size,
    statsUpserted,
    errors,
    durationMs: Date.now() - startedAt,
  };

  console.log(`[ingest] ━━━━━ Complete in ${(result.durationMs / 1000).toFixed(1)}s ━━━━━`);
  console.log(`[ingest] Players: ${result.playersUpserted} | Stats: ${result.statsUpserted} | Errors: ${result.errors.length}`);

  return result;
}