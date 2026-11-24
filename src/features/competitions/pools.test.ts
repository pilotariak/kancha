import { groupByDay } from "./matchDays";
import { groupByPool, type PoolMatch } from "./pools";

type Match = PoolMatch & { id: string };

interface Team {
  club: string;
  name?: string;
  licences: string[];
}

const team = (club: string, ...licences: string[]): Team => ({ club, licences });
const side = (club: string, name: string, ...licences: string[]): Team => ({
  club,
  name,
  licences,
});
const lineup = (licences: string[]) => ({
  player1: licences[0] ? { name: "", number: licences[0] } : undefined,
  player2: licences[1] ? { name: "", number: licences[1] } : undefined,
});

const match = (
  phase: string,
  dateMatch: string | undefined,
  a: Team,
  b: Team,
  options: { scores?: string; lineups?: boolean } = {},
): Match => ({
  id: phase,
  phase,
  dateMatch,
  scores: "scores" in options ? options.scores : "15/10 15/08",
  clubA: { id: a.club, name: a.name ?? a.club },
  clubB: { id: b.club, name: b.name ?? b.club },
  clubALineup: options.lineups === false ? undefined : lineup(a.licences),
  clubBLineup: options.lineups === false ? undefined : lineup(b.licences),
});

// Months are 0-based in the Date constructor: this is 20 November 2026, 10:00 local time.
const now = new Date(2026, 10, 20, 10, 0);

/** The pools of one pool round, the matches given in match number order as the screen sorts them. */
const pools = (matches: Match[]) => groupByPool(groupByDay([matches], now)[0]);
const ids = (result: ReturnType<typeof pools>) =>
  result?.map((pool) => pool.results.map((r) => r.id));

// Shaped on lcapb competition 502, Trinquet / P.G. Creuse Masculin, 3ème Série (Frontis,
// 2026-11-24): eight teams, two pools of four, the matches numbered P 1 to P 12 across both.
// Libourne and Cestas have a team in each pool; Lège lists a third player in one match.
const libourne1 = team("libourne", "11", "12");
const haillan = team("haillan", "21", "22");
const lege = team("lege", "31", "32");
const cestas1 = team("cestas", "41", "42");
const libourne2 = team("libourne", "51", "52");
const cestas2 = team("cestas", "61", "62");
const akitania = team("akitania", "71", "72");
const boienne = team("boienne", "81", "82");

const round = (overrides: Partial<Record<string, Match>> = {}): Match[] =>
  [
    match("P 1", "18/01/2026", libourne1, haillan),
    match("P 2", "18/01/2026", haillan, lege),
    match("P 3", "01/02/2026", haillan, cestas1),
    match("P 4", "01/02/2026", team("lege", "31", "33"), libourne1),
    match("P 5", "22/02/2026", lege, cestas1),
    match("P 6", "01/03/2026", cestas1, libourne1),
    match("P 7", "18/01/2026", akitania, cestas2),
    match("P 8", "18/01/2026", libourne2, boienne),
    match("P 9", "25/01/2026", boienne, akitania),
    match("P 10", "01/02/2026", libourne2, cestas2),
    match("P 11", "22/02/2026", akitania, libourne2),
    match("P 12", "22/02/2026", cestas2, boienne),
  ].map((m) => overrides[m.id] ?? m);

describe("groupByPool", () => {
  it("finds the pools from who played whom, not from the match number", () => {
    const result = pools(round());
    expect(result?.map((p) => [p.key, p.number])).toEqual([["pool-1", 1], ["pool-2", 2]]);
    expect(ids(result)).toEqual([
      ["P 1", "P 2", "P 3", "P 4", "P 5", "P 6"],
      ["P 7", "P 8", "P 9", "P 10", "P 11", "P 12"],
    ]);
  });

  it("orders the matches of a pool by date, the matches whose date is to come last", () => {
    const result = pools(round({
      "P 1": match("P 1", undefined, libourne1, haillan, { scores: undefined }),
      "P 5": match("P 5", "04/01/2026", lege, cestas1),
    }));
    expect(ids(result)?.[0]).toEqual(["P 5", "P 2", "P 3", "P 4", "P 6", "P 1"]);
  });

  it("numbers the pools by their lowest match number", () => {
    // The second pool plays first.
    const result = pools(round({ "P 7": match("P 7", "04/01/2026", akitania, cestas2) }));
    expect(ids(result)?.map((pool) => pool[0])).toEqual(["P 1", "P 7"]);
  });

  it("opens a pool when one of its days opens", () => {
    // The most recent day with a score is 1 March: only the first pool plays then.
    const result = pools(round());
    expect(result?.map((p) => p.open)).toEqual([true, false]);
    expect(result?.map((p) => p.today)).toEqual([false, false]);
  });

  it("marks a pool that plays today", () => {
    const result = pools(round({
      "P 12": match("P 12", "20/11/2026", cestas2, boienne, { scores: undefined }),
    }));
    expect(result?.map((p) => p.today)).toEqual([false, true]);
    expect(result?.map((p) => p.open)).toEqual([true, true]);
  });

  it("places a match without lineups by a club that plays in one pool only", () => {
    // Cestas has a team in each pool, Boienne plays in the second only.
    const result = pools(round({
      "P 12": match("P 12", "22/02/2026", cestas2, boienne, { lineups: false }),
    }));
    expect(ids(result)?.[1]).toContain("P 12");
  });

  it("keeps the days when a match without lineups could be in either pool", () => {
    // Libourne and Cestas both have a team in each pool.
    expect(pools(round({
      "P 10": match("P 10", "01/02/2026", libourne2, cestas2, { lineups: false }),
    }))).toBeNull();
  });

  it("keeps the days when the matches form a single pool", () => {
    expect(pools(round().slice(0, 6))).toBeNull();
    // A match between the two pools joins them.
    expect(pools([...round(), match("P 13", "08/03/2026", haillan, akitania)])).toBeNull();
  });

  it("keeps the days with no match", () => {
    expect(pools([])).toBeNull();
  });
});

/** A row as Frontis returns it, with the `pool` and `poolPhase` of pilotariak/frontis#114. */
const row = (
  id: string,
  phase: string,
  dateMatch: string,
  scores: string,
  a: Team,
  b: Team,
  pool: number | null,
  poolPhase: number | null = null,
): Match => ({ ...match(phase, dateMatch, a, b, { scores }), id, pool, poolPhase });

const keys = (result: ReturnType<typeof pools>) =>
  result?.map((pool) => [pool.key, pool.poolPhase, pool.number]);

// lcapb competition 502, Trinquet / P.G. Creuse Masculin, 3ème Série (Frontis specialty 143,
// category 1575): the pool round as Frontis returned it on 2026-11-24, with the league site's
// pools added by hand. "Poules 1" lists P 1 to P 6, "Poules 2" P 7 to P 12; the knockout rounds
// (Q, D, F) have none. The site names a single pool phase: `poolPhase` is null.
const LIBOURNE = ["4077", "AS LIBOURNAISE PELOTE BASQUE"] as const;
const CESTAS = ["4064", "S.A. GAZINET CESTAS"] as const;
const t502 = {
  libourne1: side(...LIBOURNE, "103307", "040216"),
  libourne2: side(...LIBOURNE, "106721", "081825"),
  haillan: side("4063", "AMIS DE LA PEL.BASQUE-LE HAILLAN", "092218", "097991"),
  lege: side("4139", "PILOTARI CLUB LEGE-CAP-FERRET", "079009", "073301"),
  cestas1: side(...CESTAS, "107373", "097031"),
  cestas2: side(...CESTAS, "110205", "093829"),
  akitania: side("4090", "AKITANIA PELOTE BASQUE", "036737", "111210"),
  boienne: side("4067", "CANCHA BOIENNE", "103501", "077313"),
};

/** The pool of each match number, P 1 to P 12: the league site's by default. */
const lcapbRound = (pool: (n: number) => number | null = (n) => (n <= 6 ? 1 : 2)): Match[] => [
  row("10170", "P 1", "18/01/2026", "03/15 02/15", t502.libourne1, t502.haillan, pool(1)),
  row("10171", "P 2", "18/01/2026", "15/10 15/07", t502.haillan, t502.lege, pool(2)),
  row("10172", "P 3", "01/02/2026", "15/11 15/09", t502.haillan, t502.cestas1, pool(3)),
  row("10173", "P 4", "01/02/2026", "15/10 15/10", t502.lege, t502.libourne1, pool(4)),
  row("10174", "P 5", "22/02/2026", "10/15 08/15", t502.lege, t502.cestas1, pool(5)),
  row("10175", "P 6", "01/03/2026", "13/15 15/08 08/10", t502.cestas1, t502.libourne1, pool(6)),
  row("10176", "P 7", "18/01/2026", "15/07 15/08", t502.akitania, t502.cestas2, pool(7)),
  row("10177", "P 8", "18/01/2026", "05/15 13/15", t502.libourne2, t502.boienne, pool(8)),
  row("10178", "P 9", "25/01/2026", "06/15 02/15", t502.boienne, t502.akitania, pool(9)),
  row("10179", "P 10", "01/02/2026", "05/15 05/15", t502.libourne2, t502.cestas2, pool(10)),
  row("10180", "P 11", "22/02/2026", "15/05 15/02", t502.akitania, t502.libourne2, pool(11)),
  row("10181", "P 12", "22/02/2026", "13/15 15/08 09/10", t502.cestas2, t502.boienne, pool(12)),
];

// ctpb competition 137, Mur à Gauche / Main nue Tête à Tête - Groupe B, M14 (Frontis specialty
// 115, category 778; on the league site, competition 20260104, InSpec 172, InCat 8), as Frontis
// returned it on 2026-11-24: one player a side. The site lists several pool blocks whose match
// numbers start again at P 1. These rows are "Poules 1" and "Poules 2" of "GROUPE B Poule phase
// 2" (28 September) and of "GROUPE B Poule phase 3" (5 October), with those numbers added by
// hand. Players go on from one phase to the next.
const t137 = {
  stPee: side("1972", "ST PEE U.C.", "104279"),
  itsasu1: side("2055", "ITSASUARRAK", "107947"),
  itsasu2: side("2055", "ITSASUARRAK", "102262"),
  kanbo1: side("1986", "KANBOARRAK", "103151"),
  kanbo2: side("1986", "KANBOARRAK", "103146"),
  kanbo3: side("1986", "KANBOARRAK", "103144"),
  zaharrer: side("1965", "ZAHARRER SEGI", "102899"),
  noizbait1: side("1967", "NOIZBAIT", "102592"),
  noizbait2: side("1967", "NOIZBAIT", "102500"),
  abarratia: side("2048", "ABARRATIA", "102220"),
  goizeko: side("1907", "GOIZEKO IZARRA", "104762"),
  amikuze: side("2004", "U.S.S.P. AMIKUZE", "105936"),
  oztibar: side("2027", "OZTIBARTARRAK", "106904"),
  uhaldean: side("2059", "UHALDEAN", "104652"),
};

const ctpbPhases = (): Match[] => [
  row("3451", "P 1", "28/09/2025", "04/12", t137.stPee, t137.itsasu1, 1, 2),
  row("3452", "P 2", "28/09/2025", "05/12", t137.itsasu1, t137.itsasu2, 1, 2),
  row("3453", "P 3", "28/09/2025", "12/03", t137.itsasu2, t137.stPee, 1, 2),
  row("3454", "P 4", "28/09/2025", "12/05", t137.kanbo1, t137.zaharrer, 2, 2),
  row("3455", "P 5", "28/09/2025", "09/12", t137.zaharrer, t137.noizbait1, 2, 2),
  row("3456", "P 6", "28/09/2025", "09/12", t137.noizbait1, t137.kanbo1, 2, 2),
  row("3469", "P 1", "05/10/2025", "12/08", t137.kanbo2, t137.kanbo3, 1, 3),
  row("3470", "P 2", "05/10/2025", "02/12", t137.kanbo3, t137.itsasu2, 1, 3),
  row("3471", "P 3", "05/10/2025", "12/08", t137.itsasu2, t137.kanbo2, 1, 3),
  row("3472", "P 4", "05/10/2025", "09/12", t137.abarratia, t137.goizeko, 2, 3),
  row("3473", "P 5", "05/10/2025", "06/12", t137.goizeko, t137.kanbo1, 2, 3),
  row("3474", "P 6", "05/10/2025", "12/09", t137.kanbo1, t137.abarratia, 2, 3),
];

describe("groupByPool with the pools from Frontis", () => {
  it("reads the pool of every match", () => {
    const result = pools(lcapbRound());
    expect(keys(result)).toEqual([["pool-1", null, 1], ["pool-2", null, 2]]);
    expect(ids(result)).toEqual([
      ["10170", "10171", "10172", "10173", "10174", "10175"],
      ["10176", "10177", "10178", "10179", "10180", "10181"],
    ]);
    // A pool opens as its days do: the most recent day with a score, 1 March, is in the first.
    expect(result?.map((p) => p.open)).toEqual([true, false]);
  });

  it("numbers a pool as the league site does, not by its rank", () => {
    // "Poules 4" and "Poules 5" of the ctpb pair's "GROUPE B Poule phase 2", P 10 to P 15: the
    // round's only pool phase here, so it does not split it.
    const result = pools([
      row("3460", "P 10", "28/09/2025", "12/06", t137.amikuze, t137.oztibar, 4, 2),
      row("3461", "P 11", "28/09/2025", "04/12", t137.oztibar, t137.kanbo2, 4, 2),
      row("3462", "P 12", "28/09/2025", "12/08", t137.kanbo2, t137.amikuze, 4, 2),
      row("3463", "P 13", "28/09/2025", "12/07", t137.goizeko, t137.uhaldean, 5, 2),
      row("3464", "P 14", "28/09/2025", "12/10", t137.uhaldean, t137.noizbait2, 5, 2),
      row("3465", "P 15", "28/09/2025", "12/11", t137.noizbait2, t137.goizeko, 5, 2),
    ]);
    expect(keys(result)).toEqual([["pool-4", null, 4], ["pool-5", null, 5]]);
    expect(ids(result)).toEqual([["3460", "3461", "3462"], ["3463", "3464", "3465"]]);
  });

  it("splits the round by pool phase, then by pool", () => {
    const result = pools(ctpbPhases());
    expect(keys(result)).toEqual([
      ["phase-2-pool-1", 2, 1],
      ["phase-2-pool-2", 2, 2],
      ["phase-3-pool-1", 3, 1],
      ["phase-3-pool-2", 3, 2],
    ]);
    expect(ids(result)).toEqual([
      ["3451", "3452", "3453"],
      ["3454", "3455", "3456"],
      ["3469", "3470", "3471"],
      ["3472", "3473", "3474"],
    ]);
  });

  it("keeps the days with a single pool", () => {
    expect(pools(lcapbRound().slice(0, 6))).toBeNull();
  });

  it("infers every pool when a match has none", () => {
    // P 12 as Frontis stored it before it read the pools.
    const mixed = pools(lcapbRound((n) => (n === 12 ? null : n <= 6 ? 1 : 2)));
    const inferred = pools(lcapbRound(() => null));
    expect(keys(mixed)).toEqual([["pool-1", null, 1], ["pool-2", null, 2]]);
    expect(keys(mixed)).toEqual(keys(inferred));
    expect(ids(mixed)).toEqual(ids(inferred));
  });

  it("keeps the days when a match has no pool and the inference cannot place it", () => {
    // Libourne and Cestas both have a team in each pool.
    const round = lcapbRound((n) => (n === 10 ? null : n <= 6 ? 1 : 2));
    round[9] = { ...round[9], clubALineup: undefined, clubBLineup: undefined };
    expect(pools(round)).toBeNull();
  });

  it("keeps the inference without pools, though it mixes the pool phases", () => {
    // Without the pools, the players who go on from one phase to the next join its pools.
    const result = pools(ctpbPhases().map((m) => ({ ...m, pool: null, poolPhase: null })));
    expect(ids(result)).toEqual([
      ["3451", "3452", "3453", "3469", "3470", "3471"],
      ["3454", "3455", "3456", "3472", "3473", "3474"],
    ]);
  });
});
