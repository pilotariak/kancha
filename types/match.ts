import type { Modality } from "./tournament";

export type MatchStatus = "scheduled" | "live" | "completed";

export interface Score {
  home: number;
  away: number;
}

export interface Team {
  id: string;
  name: string;
  players?: string[];
}

export interface Match {
  id: string;
  tournamentId?: string;
  tournamentName?: string;
  date: string;
  modality: Modality;
  homeTeam: Team;
  awayTeam: Team;
  score?: Score;
  sets?: Score[];
  status: MatchStatus;
  court?: string;
}
