import { NBATeamInfo } from "./../types/nba.types";
import type {
  NBACommonPlayer,
  NBAPlayerCareerStat,
  NBAPlayerInfo,
} from "../types/nba.types";

const NBA_BASE = "https://stats.nba.com/stats";

const NBA_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

// Every NBA.com endpoint returns this same shape:
// { resultSets: [{ headers: string[], rowSet: any[][] }] }
// This function zips headers + rows into typed objects — write once, use everywhere
function parseResultSet<T>(data: unknown, resultSetIndex = 0): T[] {
  const response = data as {
    resultSets: Array<{ headers: string[]; rowSet: unknown[][] }>;
  };
  const resultSet = response.resultSets?.[resultSetIndex];

  if (!resultSet) {
    throw new Error(
      `resultSets[${resultSetIndex}] not found in NBA API Response`,
    );
  }

  const { headers, rowSet } = resultSet;

  return rowSet.map((row) =>
    headers.reduce((obj, header, i) => {
      (obj as Record<string, unknown>)[header] = row[i];
      return obj;
    }, {} as T),
  );
}

export async function fetchAllPlayers(
  season: string,
): Promise<NBACommonPlayer[]> {
  const url = `${NBA_BASE}/commonallplayers?LeagueID=00&Season=${season}&IsOnlyCurrentSeason=0`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if (!res.ok) {
    throw new Error(
      `NBA API error fetching players: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  const players = parseResultSet<NBACommonPlayer>(data, 0);
  console.log("[fetchAllPlayers] count:", players.length);
  console.log("[fetchAllPlayers] first player:", players[0]);

  return players;
}

export async function fetchPlayerInfo(
  nbaPlayerId: number,
): Promise<NBAPlayerInfo | null> {
  const url = `${NBA_BASE}/commonplayerinfo?PlayerID=${nbaPlayerId}`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const playerInfo = parseResultSet<NBAPlayerInfo>(data, 0);

  return playerInfo[0] ?? null;
}

export async function fetchTeaminfo(
  nbaTeamId: number,
): Promise<NBATeamInfo | null> {
  const url = `${NBA_BASE}/teaminfocommon?TeamID=${nbaTeamId}&Season=2024-25&SeasonType=Regular+Season`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const teamInfo = parseResultSet<NBATeamInfo>(data, 0);

  return teamInfo[0] ?? null;
}

export async function fetchPlayerCareerStats(
  nbaPlayerId: number,
): Promise<NBAPlayerCareerStat[]> {
  const url = `${NBA_BASE}/playercareerstats?PerMode=PerGame&PlayerID=${nbaPlayerId}`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if (!res.ok) {
    throw new Error(
      `NBA API error fetching player ${nbaPlayerId}: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  const stats = parseResultSet<NBAPlayerCareerStat>(data, 0);
  console.log(
    "[fetchPlayerCareerStats] playerID:",
    nbaPlayerId,
    "seasons:",
    stats.length,
  );
  console.log("[fetchPlayerCareerStats] career stats:", stats);

  return stats;
}

//fetchAllPlayers("2025-26").then(console.log).catch(console.error);

//fetchPlayerCareerStats(1112).then(console.log).catch(console.error);

//fetchPlayerInfo(23).then(console.log).catch(console.error);

//fetchTeaminfo(1610612739).then(console.log).catch(console.error);
