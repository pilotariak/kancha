export interface Competition {
  id: string;
  name: string;
  year?: number;
  level?: string;
}

export interface Club {
  id: string;
  name: string;
}

export interface Specialty {
  id: string;
  name: string;
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
}

export interface Result {
  id: string;
  competition: Competition;
  specialty: Specialty;
  category?: Category;
  dateMatch?: string;
  clubA: Club;
  clubB: Club;
  scoreA?: number;
  scoreB?: number;
  phase?: string;
  clubALineup?: ClubLineup;
  clubBLineup?: ClubLineup;
}
