export interface League {
  id: string;
  name: string;
  supported: boolean;
}

export const LEAGUES: League[] = [
  { id: "lcapb", name: "Comité Côte d'Argent Pelote Basque", supported: true },
  { id: "ctpb", name: "Comité Territorial Pays Basque", supported: false },
  { id: "cbp", name: "Comité du Béarn de Pelote", supported: false },
  { id: "clpb", name: "Comité des Landes de Pelote Basque", supported: false },
  { id: "lifpb", name: "Ligue d'Île-de-France de Pelote Basque", supported: false },
];
