import type { Club, Result } from "@/types/competition";

/**
 * From Frontis (lcapb), 22 November 2026: `results(clubId, competitionId)` for the club and
 * competition of each ranking of PUCHEUX Theo, licence 066629: 108, 37, 34 and 58 results. The 36
 * whose lineups hold his licence, and four results without it: his partner without him (11552),
 * two matches between teams of one club, PUCHEUX Kevin in the second (9771, 13056), and a match
 * with no score (12904). Verbatim, but for the nulls Frontis sends as a singles `player2` and
 * a missing score: they are left out.
 */
export const PUCHEUX_THEO = "066629";

const SEASON_2026 = { id: "502", name: "Championnat CCAPB 2025-2026" };
const SEASON_2025 = { id: "506", name: "Championnat CCAPB 2024-2025" };
const SEASON_2024 = { id: "507", name: "Championnat CCAPB 2023-2024" };
const SEASON_2021 = { id: "517", name: "Championnat CCAPB 2020-2021" };
const MUR_CREUSE_INDIVIDUEL = { id: "136", name: "Mur à Gauche / P.G. Creuse Masculin Individuel" };
const PLACE_LIBRE_PLEINE_FEMININE = { id: "140", name: "Place Libre / P.G Pleine Feminine" };
const TRINQUET_CREUSE = { id: "143", name: "Trinquet / P.G. Creuse Masculin" };
const TRINQUET_PLEINE = { id: "146", name: "Trinquet / P.G. Pleine Masculin" };
const SERIE_1 = { id: "1573", name: "1ère Série" };
const SERIE_2 = { id: "1574", name: "2ème Série" };

const CLUB_4061: Club = { id: "4061", name: "PILOTARI IRRATZABAL CLUB" };
const CLUB_4062: Club = { id: "4062", name: "CA BEGLAIS" };
const CLUB_4063: Club = { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" };
const CLUB_4064: Club = { id: "4064", name: "S.A. GAZINET CESTAS" };
const CLUB_4066: Club = { id: "4066", name: "US BAZAS PELOTE BASQUE" };
const CLUB_4067: Club = { id: "4067", name: "CANCHA BOIENNE" };
const CLUB_4068: Club = { id: "4068", name: "PILOTARI CLUB VILLENAVAIS" };
const CLUB_4090: Club = { id: "4090", name: "AKITANIA PELOTE BASQUE" };
const CLUB_4132: Club = { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" };

type Entry = Pick<Result, "competition" | "specialty" | "category">;

const MUR_CREUSE_INDIVIDUEL_2026_SERIE_1: Entry = {
  competition: SEASON_2026,
  specialty: MUR_CREUSE_INDIVIDUEL,
  category: SERIE_1,
};
const PLACE_LIBRE_PLEINE_FEMININE_2021_SERIE_2: Entry = {
  competition: SEASON_2021,
  specialty: PLACE_LIBRE_PLEINE_FEMININE,
  category: SERIE_2,
};
const TRINQUET_CREUSE_2021_SERIE_1: Entry = {
  competition: SEASON_2021,
  specialty: TRINQUET_CREUSE,
  category: SERIE_1,
};
const TRINQUET_CREUSE_2024_SERIE_2: Entry = {
  competition: SEASON_2024,
  specialty: TRINQUET_CREUSE,
  category: SERIE_2,
};
const TRINQUET_CREUSE_2025_SERIE_1: Entry = {
  competition: SEASON_2025,
  specialty: TRINQUET_CREUSE,
  category: SERIE_1,
};
const TRINQUET_PLEINE_2024_SERIE_1: Entry = {
  competition: SEASON_2024,
  specialty: TRINQUET_PLEINE,
  category: SERIE_1,
};
const TRINQUET_PLEINE_2025_SERIE_1: Entry = {
  competition: SEASON_2025,
  specialty: TRINQUET_PLEINE,
  category: SERIE_1,
};

export const PUCHEUX_THEO_RESULTS: Result[] = [
  {
    id: "9761",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "17/01/2026",
    phase: "P 2",
    scores: "15/08 15/09",
    clubA: CLUB_4063,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
    clubBLineup: {
      player1: { name: "GARCIA Antoine", number: "073842" },
    },
  },
  {
    id: "9762",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "17/01/2026",
    phase: "P 3",
    scores: "15/03 15/06",
    clubA: CLUB_4063,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
    clubBLineup: {
      player1: { name: "DE-BOUYN Aubin (D)", number: "100169" },
    },
  },
  {
    id: "9764",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "24/01/2026",
    phase: "P 5",
    scores: "09/15 15/10 02/10",
    clubA: CLUB_4062,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "GONZALEZ Antoine", number: "058964" },
    },
    clubBLineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
  },
  {
    id: "9765",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "24/01/2026",
    phase: "P 6",
    scores: "01/15 03/15",
    clubA: CLUB_4061,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "PRADERE Bastien (S)", number: "107759" },
    },
    clubBLineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
  },
  {
    id: "9771",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "17/01/2026",
    phase: "P 12",
    scores: "15/06 15/07",
    clubA: CLUB_4063,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "TOURON Robin (ED)", number: "097866 - 01-641-015" },
    },
    clubBLineup: {
      player1: { name: "SOURBES Hugo (D)", number: "096903" },
    },
  },
  {
    id: "9780",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "04/02/2026",
    phase: "Q 1",
    scores: "15/02 15/06",
    clubA: CLUB_4063,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
    clubBLineup: {
      player1: { name: "DENDARY Raphael (D)", number: "092294" },
    },
  },
  {
    id: "9784",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "28/02/2026",
    phase: "D 1",
    scores: "15/08 15/03",
    clubA: CLUB_4063,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
    clubBLineup: {
      player1: { name: "CAZAUBON Mattin", number: "067777" },
    },
  },
  {
    id: "9786",
    ...MUR_CREUSE_INDIVIDUEL_2026_SERIE_1,
    dateMatch: "28/02/2026",
    phase: "F 1",
    scores: "15/01 15/05",
    clubA: CLUB_4063,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "PUCHEUX Theo", number: "066629" },
    },
    clubBLineup: {
      player1: { name: "DUFFOUR-NONNON Lucas (D)", number: "096222" },
    },
  },
  {
    id: "10876",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "22/09/2024",
    phase: "P 8",
    scores: "13/15 15/07 10/07",
    clubA: CLUB_4132,
    clubB: CLUB_4064,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "BORDACHAR Serge (E)", number: "016667 - 01-330-065" },
      player2: { name: "SEINDERAIN Gerard (E)", number: "009571 - 01-330-065" },
    },
  },
  {
    id: "10880",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "09/10/2024",
    phase: "P 12",
    scores: "15/09 15/03",
    clubA: CLUB_4132,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "VIGNEAUX Thomas", number: "101758" },
      player2: { name: "LAMORERE Sebastien", number: "101752" },
    },
  },
  {
    id: "10881",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "20/10/2024",
    phase: "P 13",
    scores: "15/11 15/03",
    clubA: CLUB_4132,
    clubB: CLUB_4064,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "MAGNIER Mattew (D)", number: "105279" },
      player2: { name: "SAINT-AMANS Gregory", number: "100627" },
    },
  },
  {
    id: "10882",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "20/10/2024",
    phase: "P 14",
    scores: "03/15 07/15",
    clubA: CLUB_4090,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "CREPIN Alexis", number: "050472" },
      player2: { name: "DUMESTE Julien", number: "039142" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10883",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "27/10/2024",
    phase: "P 15",
    scores: "07/15 07/15",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "GARCIA Antoine", number: "073842" },
      player2: { name: "MARQUE Alexandre (E)", number: "080286 - 01-642-036" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10887",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "03/11/2024",
    phase: "B1T 4",
    scores: "05/15 12/15",
    clubA: CLUB_4090,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "GARCIA Jean jacques", number: "039161" },
      player2: { name: "ETCHEVERRY Marc (E)", number: "069973 - 01-330-023" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10888",
    ...TRINQUET_CREUSE_2025_SERIE_1,
    dateMatch: "11/11/2024",
    phase: "B2T 1",
    scores: "15/07 11/15 10/09",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" },
      player2: { name: "GUILLENTEGUY Patxi", number: "050292" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10983",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "12/02/2025",
    phase: "P 7",
    scores: "17/40",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "VIGNEAUX Thomas", number: "101758" },
      player2: { name: "LAMORERE Sebastien", number: "101752" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10987",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "16/02/2025",
    phase: "P 11",
    scores: "40/12",
    clubA: CLUB_4132,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "BEDECARRAX Patrice", number: "053104" },
      player2: { name: "LAUSSUCQ Christophe", number: "080426" },
    },
  },
  {
    id: "10988",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "23/02/2025",
    phase: "P 12",
    scores: "40/31",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" },
      player2: { name: "GUILLENTEGUY Patxi", number: "050292" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10992",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "28/02/2025",
    phase: "P 16",
    scores: "40/26",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "MARTIN Etienne", number: "059098" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "10994",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "02/03/2025",
    phase: "P 18",
    scores: "36/40",
    clubA: CLUB_4132,
    clubB: CLUB_4068,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "NICOL Guillaume", number: "059063" },
      player2: { name: "GONZALEZ Antoine (E)", number: "058964 - 01-330-005" },
    },
  },
  {
    id: "10996",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "02/03/2025",
    phase: "P 20",
    scores: "40/21",
    clubA: CLUB_4132,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "BEDECARRAX Peyo", number: "057887" },
      player2: { name: "CAZAUBON Mattin", number: "067777" },
    },
  },
  {
    id: "11013",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "09/03/2025",
    phase: "B1T 1",
    scores: "40/14",
    clubA: CLUB_4132,
    clubB: CLUB_4064,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "LESCURIER Denis", number: "100068" },
      player2: { name: "SEINDERAIN Gerard (E)", number: "009571 - 01-330-065" },
    },
  },
  {
    id: "11017",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "16/03/2025",
    phase: "B2T 1",
    scores: "40/20",
    clubA: CLUB_4132,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "BEDECARRAX Peyo", number: "057887" },
      player2: { name: "CAZAUBON Mattin", number: "067777" },
    },
  },
  {
    id: "11019",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "30/03/2025",
    phase: "BM 1",
    scores: "30/40",
    clubA: CLUB_4132,
    clubB: CLUB_4068,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "NICOL Guillaume", number: "059063" },
      player2: { name: "GONZALEZ Antoine (E)", number: "058964 - 01-330-005" },
    },
  },
  {
    id: "11021",
    ...TRINQUET_PLEINE_2025_SERIE_1,
    dateMatch: "23/03/2025",
    phase: "D 2",
    scores: "40/13",
    clubA: CLUB_4062,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "MARTIN Etienne", number: "059098" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "11489",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "24/09/2023",
    phase: "P 3",
    scores: "03/15 07/15",
    clubA: CLUB_4090,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "CREPIN Alexis", number: "050472" },
      player2: { name: "METAYER Frederic", number: "086058" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "11492",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "01/10/2023",
    phase: "P 6",
    scores: "15/03 15/02",
    clubA: CLUB_4132,
    clubB: CLUB_4063,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "DUFFOUR-NONNON Lucas (D)", number: "096222" },
      player2: { name: "DENDARY Raphael (D)", number: "092294" },
    },
  },
  {
    id: "11493",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "08/10/2023",
    phase: "P 7",
    scores: "00/15 01/15",
    clubA: CLUB_4064,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "REGUS Joel", number: "068838" },
      player2: { name: "PLIHON Christophe", number: "081783" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
  },
  {
    id: "11496",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "17/10/2023",
    phase: "P 10",
    scores: "15/04 15/04",
    clubA: CLUB_4132,
    clubB: CLUB_4067,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "BARBEZAT Frederic", number: "103126" },
      player2: { name: "MAILLOUQUET Sebastien", number: "082157" },
    },
  },
  {
    id: "11527",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "05/11/2023",
    phase: "Q 1",
    scores: "15/03 15/01",
    clubA: CLUB_4132,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "PRADERE Bastien (S)", number: "107759" },
      player2: { name: "PRADERE Christophe", number: "073689" },
    },
  },
  {
    id: "11531",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "11/11/2023",
    phase: "D 1",
    scores: "15/08 13/15 10/04",
    clubA: CLUB_4132,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "GARCIA Antoine", number: "073842" },
      player2: { name: "MARQUE Alexandre (E)", number: "080286 - 01-642-036" },
    },
  },
  {
    id: "11533",
    ...TRINQUET_CREUSE_2024_SERIE_2,
    dateMatch: "12/11/2023",
    phase: "F 1",
    scores: "15/03 15/06",
    clubA: CLUB_4132,
    clubB: CLUB_4064,
    clubALineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
    },
    clubBLineup: {
      player1: { name: "FEVRIER Mathieu", number: "092426" },
      player2: { name: "SEINDERAIN Gerard (E)", number: "009571 - 01-330-065" },
    },
  },
  {
    id: "11552",
    ...TRINQUET_PLEINE_2024_SERIE_1,
    dateMatch: "21/01/2024",
    phase: "P 3",
    scores: "36/40",
    clubA: CLUB_4064,
    clubB: CLUB_4132,
    clubALineup: {
      player1: { name: "SAINT-AMANS Gregory", number: "100627" },
      player2: { name: "SEINDERAIN Gerard (E)", number: "009571 - 01-330-065" },
    },
    clubBLineup: {
      player1: { name: "JANY Alexandre", number: "054123" },
      player2: { name: "FIGEROU Benedict", number: "103493" },
    },
  },
  {
    id: "12904",
    ...PLACE_LIBRE_PLEINE_FEMININE_2021_SERIE_2,
    dateMatch: "06/06/2021",
    phase: "P 2",
    clubA: CLUB_4066,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "(E)", number: "086369 - 00-000-000" },
      player2: { name: "(E)", number: "087462 - 00-000-000" },
    },
    clubBLineup: {
      player1: { name: "(E)", number: "070220 - 00-000-000" },
      player2: { name: "ZABALETA Celine (E)", number: "077851 - 03-920-014" },
    },
  },
  {
    id: "13054",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "06/09/2020",
    phase: "P 4",
    scores: "07/15 15/14 10/06",
    clubA: CLUB_4062,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" },
      player2: { name: "GUILLENTEGUY Patxi", number: "050292" },
    },
    clubBLineup: {
      player1: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
  },
  {
    id: "13056",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "19/09/2020",
    phase: "P 6",
    scores: "10/15 15/12 05/10",
    clubA: CLUB_4062,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "MARTIN Etienne", number: "059098" },
      player2: { name: "GONZALEZ Antoine", number: "058964" },
    },
    clubBLineup: {
      player1: { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" },
      player2: { name: "GUILLENTEGUY Patxi", number: "050292" },
    },
  },
  {
    id: "13058",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "20/09/2020",
    phase: "P 8",
    scores: "15/08 14/15 10/01",
    clubA: CLUB_4062,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
    clubBLineup: {
      player1: { name: "MARTIN Etienne", number: "059098" },
      player2: { name: "GONZALEZ Antoine", number: "058964" },
    },
  },
  {
    id: "13060",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "17/10/2020",
    phase: "P 10",
    scores: "10/15 15/13 07/10",
    clubA: CLUB_4063,
    clubB: CLUB_4062,
    clubALineup: {
      player1: { name: "NICOL Guillaume (E)", number: "059063 - 01-330-018" },
      player2: { name: "(E)", number: "065761 - 00-000-000" },
    },
    clubBLineup: {
      player1: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
  },
  {
    id: "13061",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "18/10/2020",
    phase: "P 11",
    scores: "15/10 15/11",
    clubA: CLUB_4062,
    clubB: CLUB_4061,
    clubALineup: {
      player1: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
    clubBLineup: {
      player1: { name: "HAURIE Laurent (E)", number: "050037 - 01-330-086" },
      player2: { name: "CAZAUBON Mattin (S)", number: "067777" },
    },
  },
  {
    id: "13063",
    ...TRINQUET_CREUSE_2021_SERIE_1,
    dateMatch: "18/10/2020",
    phase: "P 13",
    scores: "15/07 15/10",
    clubA: CLUB_4062,
    clubB: CLUB_4090,
    clubALineup: {
      player1: { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" },
      player2: { name: "SENDER Timothe", number: "073197" },
    },
    clubBLineup: {
      player1: { name: "GARCIA Jean jacques", number: "039161" },
      player2: { name: "SEINDERAIN Gerard (E)", number: "009571 - 01-330-065" },
    },
  },
];
