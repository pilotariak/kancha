import type { PlayerRanking } from "@/types/competition";

/**
 * From Frontis (lcapb), 23 November 2026: `playerRankings(licence: "066629")`, verbatim, in the
 * API order, the most recent season first. Its clubs and competitions are the pairs whose results
 * make `PUCHEUX_THEO_RESULTS`.
 */
export const PUCHEUX_THEO_RANKINGS: PlayerRanking[] = [
  {
    id: "75",
    rank: 1,
    phase: "Champion",
    final: true,
    teamNumber: 1,
    competition: { id: "502", name: "Championnat CCAPB 2025-2026" },
    specialty: { id: "136", name: "Mur à Gauche / P.G. Creuse Masculin Individuel" },
    category: { id: "1573", name: "1ère Série" },
    club: { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" },
    players: [{ licence: "066629", name: "PUCHEUX Theo" }],
  },
  {
    id: "3640",
    rank: 6,
    phase: "Barrage 2ème tour",
    final: true,
    teamNumber: 1,
    competition: { id: "506", name: "Championnat CCAPB 2024-2025" },
    specialty: { id: "143", name: "Trinquet / P.G. Creuse Masculin" },
    category: { id: "1573", name: "1ère Série" },
    club: { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" },
    players: [
      { licence: "054123", name: "JANY Alexandre" },
      { licence: "066629", name: "PUCHEUX Theo" },
    ],
  },
  {
    id: "490",
    rank: 4,
    phase: "1/2 finale",
    final: true,
    teamNumber: 1,
    competition: { id: "506", name: "Championnat CCAPB 2024-2025" },
    specialty: { id: "146", name: "Trinquet / P.G. Pleine Masculin" },
    category: { id: "1573", name: "1ère Série" },
    club: { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" },
    players: [
      { licence: "054123", name: "JANY Alexandre" },
      { licence: "066629", name: "PUCHEUX Theo" },
      { licence: "022738", name: "NAVARRINE Olivier" },
    ],
  },
  {
    id: "690",
    rank: 1,
    phase: "Champion",
    final: true,
    teamNumber: 1,
    competition: { id: "507", name: "Championnat CCAPB 2023-2024" },
    specialty: { id: "143", name: "Trinquet / P.G. Creuse Masculin" },
    category: { id: "1574", name: "2ème Série" },
    club: { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" },
    players: [
      { licence: "054123", name: "JANY Alexandre" },
      { licence: "066629", name: "PUCHEUX Theo" },
      { licence: "103493", name: "FIGEROU Benedict" },
    ],
  },
  {
    id: "3859",
    rank: 2,
    phase: "1/2 finale",
    final: false,
    teamNumber: 2,
    competition: { id: "517", name: "Championnat CCAPB 2020-2021" },
    specialty: { id: "143", name: "Trinquet / P.G. Creuse Masculin" },
    category: { id: "1573", name: "1ère Série" },
    club: { id: "4062", name: "CA BEGLAIS" },
    players: [
      { licence: "066629", name: "PUCHEUX Theo" },
      { licence: "073197", name: "SENDER Timothe" },
      { licence: "073842", name: "GARCIA Antoine" },
    ],
  },
];
