export interface NBACommonPlayer {
  PERSON_ID: number;
  DISPLAY_FIRST_LAST: string;
  TEAM_ID: number;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  ROSTERSTATUS: number;
  FROM_YEAR: string;
  TO_YEAR: string;
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
  conference: null;
}

export interface NormalizedPlayer {
  name: string;
  nba_id: number;
  team_abbreviation: string;
  position: null;
  image_url: string;
}

export interface NormalizedStat {
  nba_player_id: number;
  season: number;
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
