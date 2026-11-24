import { groupByDay } from "./matchDays";
import { groupByPool, type PoolMatch } from "./pools";

type Match = PoolMatch & { id: string };

interface Team {
  club: string;
  licences: string[];
}

const team = (club: string, ...licences: string[]): Team => ({ club, licences });
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
  clubA: { id: a.club, name: a.club },
  clubB: { id: b.club, name: b.club },
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
