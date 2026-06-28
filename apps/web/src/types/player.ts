export interface Team {
    id: string;
    name: string;
    abbreviation: string;
    conference: string | null;
    logo_url: string | null;
}

export interface PlayerStat {
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

export interface Player {
    id: string;
    name: string;
    nba_id: number;
    position: string | null;
    height: string | null;
    weight: string | null;
    image_url: string | null;
    team_id: string | null;
    nba_teams: Team | null;
    player_stats: PlayerStat[];
}

export interface PlayerResponse {
    data: Player[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number
    },
    error: string | null;
    status: number;
}

export interface PlayerFilters {
  search: string;
  team: string;
  position: string;
  conference: string;
  sortBy: "ppg" | "rpg" | "apg" | "name";
  season: number;
}