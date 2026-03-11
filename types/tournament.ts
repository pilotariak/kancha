export type TournamentStatus = "upcoming" | "active" | "completed";

export type Modality =
  | "cesta-punta"
  | "paleta-cuero"
  | "paleta-goma"
  | "mano"
  | "pala"
  | "remonte"
  | "xare"
  | "trinquete";

export const MODALITY_LABELS: Record<Modality, string> = {
  "cesta-punta": "Cesta Punta",
  "paleta-cuero": "Paleta Cuero",
  "paleta-goma": "Paleta Goma",
  mano: "Mano",
  pala: "Pala",
  remonte: "Remonte",
  xare: "Xare",
  trinquete: "Trinquete",
};

export interface Tournament {
  id: string;
  name: string;
  modality: Modality;
  startDate: string;
  endDate: string;
  location: string;
  status: TournamentStatus;
  teamsCount?: number;
  description?: string;
}
