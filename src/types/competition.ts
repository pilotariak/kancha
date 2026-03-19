export interface Specialty {
  id: string;
  name: string;
}

export interface Club {
  id: string;
  name: string;
}

export interface Player {
  name: string;
  number?: string | null;
}

export interface ClubLineup {
  player1?: Player | null;
  player2?: Player | null;
}

export interface Competition {
  id: string;
  year: number;
  name: string;
  level?: string | null;
}

export interface Result {
  id: string;
  competition: Competition;
  specialty: Specialty;
  category?: string | null;
  dateMatch?: string | null;
  clubA: Club;
  clubB: Club;
  scoreA?: number | null;
  scoreB?: number | null;
  phase?: string | null;
  clubALineup?: ClubLineup | null;
  clubBLineup?: ClubLineup | null;
}
