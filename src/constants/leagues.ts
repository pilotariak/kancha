export interface League {
  id: string;
  name: string;
  /** The letters on the league's tile. Proposed in #95, still to be confirmed by each committee. */
  code: string;
  supported: boolean;
}

export const LEAGUES: League[] = [
  { id: "lcapb", name: "Comité Côte d'Argent Pelote Basque", code: "CA", supported: true },
  { id: "ctpb", name: "Comité Territorial Pays Basque", code: "PB", supported: true },
  { id: "cbp", name: "Comité du Béarn de Pelote", code: "BÉ", supported: false },
  { id: "llpb", name: "Comité des Landes de Pelote Basque", code: "LA", supported: true },
  { id: "lidfpb", name: "Ligue d'Île-de-France de Pelote Basque", code: "IDF", supported: true },
  { id: "ffpb", name: "Fédération Française de Pelote Basque", code: "FR", supported: true },
];
