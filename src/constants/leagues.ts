export interface League {
  id: string;
  name: string;
  supported: boolean;
}

export const LEAGUES: League[] = [
  { id: "lcapb", name: "Comité Côte d'Argent Pelote Basque", supported: true },
  { id: "ctpb", name: "Comité Territorial Pays Basque", supported: true },
  { id: "cbp", name: "Comité du Béarn de Pelote", supported: false },
  { id: "llpb", name: "Comité des Landes de Pelote Basque", supported: true },
  { id: "lifpb", name: "Ligue d'Île-de-France de Pelote Basque", supported: false },
];
