export interface Competition {
  id: string;
  name: string;
  year?: number;
  level?: string;
  enabled?: boolean;
}

export interface Club {
  id: string;
  name: string;
}

export interface Specialty {
  id: string;
  name: string;
  enabled?: boolean;
}

export interface Player {
  name: string;
  number?: string;
}

export interface ClubLineup {
  player1?: Player;
  player2?: Player;
}

export interface Category {
  id: string;
  name: string;
  enabled?: boolean;
}

/** A specialty and category of a competition: a pair that holds results, or the pair on screen. */
export interface SpecialtyCategory {
  specialtyId: string;
  categoryId: string;
}

export interface Result {
  id: string;
  competition: Competition;
  specialty: Specialty;
  category?: Category;
  dateMatch?: string;
  clubA: Club;
  clubB: Club;
  scores?: string;
  phase?: string;
  clubALineup?: ClubLineup;
  clubBLineup?: ClubLineup;
}

export interface RankedPlayer {
  licence: string;
  /** Null when the league site lists the licence alone. */
  name: string | null;
}

export interface TeamRanking {
  id: string;
  club: Club;
  teamNumber: number;
  rank: number;
  /** Raw French text from the league site: "Champion", "1/2 finale", "FORFAIT"… */
  phase: string;
  /** False while the championship is still running: ranks and phases are provisional. */
  final: boolean;
  players: RankedPlayer[];
}

/** A team ranking from `playerRankings`, which also names its competition, specialty and category. */
export interface PlayerRanking extends TeamRanking {
  competition: Competition;
  specialty: Specialty;
  category: Category;
}
