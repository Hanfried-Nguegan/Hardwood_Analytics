export type JobStatus = "idle" | "running" | "done" | "failed";

export interface JobState {
  status: JobStatus;
  startedAt: number | null;
  result: IngestResult | null;
  error: string | null;
}

export interface NBACommonPlayer {
  PERSON_ID: number;
  DISPLAY_FIRST_LAST: string;
  TEAM_ID: number;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  ROSTERSTATUS: number;
  FROM_YEAR: string;
  TO_YEAR: string;
  GAMES_PLAYED_FLAG: "Y" | "N"; // this field indicates if player has played a game
}

export interface NBAPlayerInfo {
  PERSON_ID: number;
  POSITION: string;
  HEIGHT: string;
  WEIGHT: string;
}

export interface NBATeamInfo {
  TEAM_ID: number;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  TEAM_NAME: string;
  TEAM_CONFERENCE: string; // "East" or "West"
}

export interface NBAPlayerCareerStat {
  PLAYER_ID: number;
  SEASON_ID: string;
  TEAM_ABBREVIATION: string;
  GP: number;
  PTS: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  FG_PCT: number;
  FG3_PCT: number;
  FT_PCT: number;
}

export interface NormalizedTeam {
  name: string;
  abbreviation: string;
  conference: string | null;
  logo_url: string | null;
}

export interface NormalizedPlayer {
  name: string;
  nba_id: number;
  team_abbreviation: string;
  position: string | null;
  height: string | null;
  weight: string | null;
  image_url: string;
}

export interface NormalizedStat {
  nba_player_id: number;
  season: number;
  team_abbreviation: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  three_pct: number;
  ft_pct: number;
}

export interface IngestResult {
  teamsUpserted: number;
  playersUpserted: number;
  statsUpserted: number;
  errors: string[];
  durationMs: number;
}

export interface IngestOptions {
  season?: string;
  statsLimit?: number;
  delayMs?: number;
}

export interface PlayerRow {
  id: string;
  name: string;
  nba_id: number;
  position: string | null;
  height: string | null;
  weight: string | null;
  image_url: string | null;
  team_id: string | null;
  nba_teams: {
    id: string;
    name: string;
    abbreviation: string;
    conference: string | null;
    logo_url: string | null;
  } | null;
  player_stats: {
    season: number;
    team_abbreviation: string;
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fg_pct: number;
    three_pct: number;
    ft_pct: number;
  }[];
}

export interface GetPlayersOptions {
  page?: number;
  limit?: number;
  search?: string;
  team?: string;
  position?: string;
  conference?: string;
  sortBy?: "ppg" | "rpg" | "apg" | "name";
  order?: "asc" | "desc";
  season?: number;
}
