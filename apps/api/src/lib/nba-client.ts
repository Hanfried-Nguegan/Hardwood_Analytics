import type { NBACommonPlayer, NBAPlayerCareerStat } from "../types/nba.types";

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
function parseResultSet<T>(data: any, resultSetIndex = 0): T[] {
  const resultSet = data.resultSets?.[resultSetIndex];

  if (!resultSet) {
    throw new Error(
      `resultSets[${resultSetIndex}] not found in NBA API Response`,
    );
  }

  const headers: string[] = resultSet.headers;
  const rows: any[][] = resultSet.rowSet;

  return rows.map((row) =>
    headers.reduce(
      (obj, header, i) => {
        obj[header] = row[i];
        return obj;
      },
      {} as Record<string, any>,
    ),
  ) as T[];
}

export async function fetchAllPlayers(season: "2024-25") {
  const url = `${NBA_BASE}/commonallplayers?LeagueID=00&Season=${season}&IsOnlyCurrentSeason=0`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if (!res.ok) {
    throw new Error(
      `NBA API error fetching players: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  return parseResultSet<NBACommonPlayer>(data);
}

export async function fetchPlayerCareerStats(nbaPlayerId: number) {
  const url = `${NBA_BASE}/playercareerstats?PerMode=PerGame&PlayerID=${nbaPlayerId}`;

  const res = await fetch(url, { headers: NBA_HEADERS });

  if(!res.ok) {
    throw new Error(`NBA API error fetching player ${nbaPlayerId}: ${res.status} ${res.statusText}`,)
  };

  const data = await res.json();

  return parseResultSet<NBAPlayerCareerStat>(data, 0);
}
