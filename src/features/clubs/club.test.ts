import type { Result } from "@/types/competition";

import {
  clubEntries,
  clubMatches,
  clubTitles,
  isTitle,
  latestResults,
  matchesByDate,
  seasonSummary,
} from "./club";

// Clubs, specialties and finals from Frontis: lcapb, Championnat CCAPB 2025-2026 (502), where
// Amis de la P.B. Le Haillan (4063) plays 108 matches, 14 of them between two of its teams.
const HAILLAN = { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" };
const BEGLAIS = { id: "4062", name: "CA BEGLAIS" };
const GAZINET = { id: "4071", name: "S.A. GAZINET CESTAS" };
const CHAMPIONNAT = { id: "502", name: "Championnat CCAPB 2025-2026" };
const CREUSE_IND = { id: "136", name: "Mur à Gauche / P.G. Creuse Masculin Individuel" };
const TRINQUET_CREUSE = { id: "143", name: "Trinquet / P.G. Creuse Masculin" };
const SERIE_1 = { id: "1573", name: "1ère Série" };
const SERIE_2 = { id: "1574", name: "2ème Série" };
const SERIE_3 = { id: "1575", name: "3ème Série" };

function result(id: string, overrides: Partial<Result> = {}): Result {
  return {
    id,
    competition: CHAMPIONNAT,
    specialty: CREUSE_IND,
    category: SERIE_1,
    dateMatch: "18/10/2025",
    phase: "P 1",
    clubA: HAILLAN,
    clubB: BEGLAIS,
    scores: "15/10 15/12",
    ...overrides,
  };
}

const ids = (matches: { result: Result }[]) => matches.map((m) => m.result.id);

describe("clubMatches", () => {
  it("reads each match from the club's side, its points first", () => {
    const [won, lost] = clubMatches([
      result("1", { clubA: BEGLAIS, clubB: HAILLAN, scores: "10/15 15/12 06/10" }),
      result("2", { scores: "11/15 15/12 09/10" }),
    ], HAILLAN.id);

    expect(won).toMatchObject({
      side: "B",
      outcome: "won",
      opponent: BEGLAIS,
      sets: [{ club: 15, opponent: 10 }, { club: 12, opponent: 15 }, { club: 10, opponent: 6 }],
    });
    expect(lost).toMatchObject({ side: "A", outcome: "lost", opponent: BEGLAIS });
  });

  it("marks a match between two teams of the club as internal, from the winner's side", () => {
    const [wonByA, wonByB] = clubMatches([
      result("9786", { clubB: HAILLAN, scores: "15/01 15/05" }),
      result("9878", { clubB: HAILLAN, scores: "33/35" }),
    ], "4063");
    expect(wonByA).toMatchObject({
      side: "A",
      outcome: "internal",
      opponent: HAILLAN,
      sets: [{ club: 15, opponent: 1 }, { club: 15, opponent: 5 }],
    });
    expect(wonByB).toMatchObject({ side: "B", sets: [{ club: 35, opponent: 33 }] });
  });

  it("keeps unscored matches as unplayed, and level sets as even", () => {
    const matches = clubMatches([
      result("1", { scores: undefined }),
      result("2", { scores: "" }),
      result("3", { scores: "F/15" }),
      result("4", { scores: "15/10 10/15" }),
      result("5", { clubB: HAILLAN, scores: "15/10 10/15" }),
    ], HAILLAN.id);
    expect(matches.map((m) => m.outcome)).toEqual([
      "unplayed",
      "unplayed",
      "unplayed",
      "even",
      "even",
    ]);
    expect(matches[0].sets).toBeNull();
  });

  it("leaves out the results the club is not in", () => {
    expect(clubMatches([result("1", { clubA: GAZINET })], HAILLAN.id)).toEqual([]);
  });
});

describe("seasonSummary", () => {
  it("counts scored matches only, and internal ones as neither won nor lost", () => {
    const summary = seasonSummary(clubMatches([
      result("1"),
      result("2", { clubA: BEGLAIS, clubB: HAILLAN }),
      result("3", { clubB: HAILLAN }),
      result("4", { scores: undefined }),
      result("5", { scores: "15/10 10/15" }),
    ], HAILLAN.id));
    expect(summary).toEqual({ played: 4, won: 1, lost: 1, internal: 1 });
  });

  it("is all zeros for a season without a match", () => {
    expect(seasonSummary([])).toEqual({ played: 0, won: 0, lost: 0, internal: 0 });
  });
});

describe("clubTitles", () => {
  // The five finals Le Haillan reached: three between its own teams, a win over Gazinet, a loss
  // to Béglais. Four titles.
  const finals = [
    result("9786", { phase: "F 1", clubB: HAILLAN, scores: "15/01 15/05" }),
    result("9795", { phase: "F 1", category: SERIE_2, clubB: HAILLAN, scores: "15/09 15/06" }),
    result("10169", {
      phase: "F 1",
      specialty: TRINQUET_CREUSE,
      category: SERIE_2,
      scores: "11/15 15/12 09/10",
    }),
    result("10188", {
      phase: "F 1",
      specialty: TRINQUET_CREUSE,
      category: SERIE_3,
      clubB: GAZINET,
      scores: "15/11 15/05",
    }),
  ];

  it("counts the finals the club won, a final between two of its teams once", () => {
    expect(ids(clubTitles(clubMatches(finals, HAILLAN.id)))).toEqual(["9786", "9795", "10188"]);
  });

  it("is no title for a lost, unscored or level final, nor a won semi-final", () => {
    const matches = clubMatches([
      result("1", { phase: "F 1", clubA: BEGLAIS, clubB: HAILLAN, scores: "15/10 15/12" }),
      result("2", { phase: "F 1", scores: undefined }),
      result("3", { phase: "F 1", clubB: HAILLAN, scores: "15/10 10/15" }),
      result("4", { phase: "D 1" }),
    ], HAILLAN.id);
    expect(matches.filter(isTitle)).toEqual([]);
  });

  it("orders titles by specialty, then category", () => {
    const titles = clubTitles(clubMatches([...finals].reverse(), HAILLAN.id));
    expect(ids(titles)).toEqual(["9786", "9795", "10188"]);
  });
});

describe("clubEntries", () => {
  it("gives one entry per specialty and category, with its match count and furthest round", () => {
    const entries = clubEntries(clubMatches([
      result("1", { category: SERIE_2, phase: "P 3" }),
      result("2", { phase: "P 1" }),
      result("3", { phase: "Q 2" }),
      result("4", { phase: "D 1", scores: undefined }),
      result("5", { category: SERIE_2, phase: "P 4" }),
      result("6", { specialty: TRINQUET_CREUSE, phase: "B1T 2" }),
    ], HAILLAN.id));

    expect(entries.map(({ key, matches, furthest, title }) => ({ key, matches, furthest, title })))
      .toEqual([
        { key: "502/136/1573", matches: 3, furthest: "D", title: false },
        { key: "502/136/1574", matches: 2, furthest: "P", title: false },
        { key: "502/143/1573", matches: 1, furthest: "B1T", title: false },
      ]);
    expect(entries[0]).toMatchObject({
      competition: CHAMPIONNAT,
      specialty: CREUSE_IND,
      category: SERIE_1,
    });
  });

  it("marks the entry whose final the club won", () => {
    const [lost, won] = clubEntries(clubMatches([
      result("1", { phase: "F 1", scores: "10/15 12/15" }),
      result("2", { phase: "F 1", category: SERIE_2, clubB: HAILLAN }),
    ], HAILLAN.id));
    expect(lost).toMatchObject({ furthest: "F", title: false });
    expect(won).toMatchObject({ furthest: "F", title: true });
  });

  it("does not take a phase the parser does not know for a round past the final", () => {
    const [entry] = clubEntries(clubMatches([
      result("1", { phase: "Q 1" }),
      result("2", { phase: "Poule A" }),
    ], HAILLAN.id));
    expect(entry.furthest).toBe("Q");

    const [unknown] = clubEntries(clubMatches([result("1", { phase: undefined })], HAILLAN.id));
    expect(unknown.furthest).toBeNull();
  });

  it("keeps the competitions of a season apart, and a result without category", () => {
    const corpo = { id: "503", name: "Championnat Corpo CCAPB 2025-2026" };
    const entries = clubEntries(clubMatches([
      result("1"),
      result("2", { competition: corpo }),
      result("3", { category: undefined }),
    ], HAILLAN.id));
    expect(entries.map((e) => e.key)).toEqual(["502/136/", "502/136/1573", "503/136/1573"]);
  });
});

describe("latestResults and matchesByDate", () => {
  const matches = clubMatches([
    result("1", { dateMatch: "29/03/2026", phase: "D 1" }),
    result("2", { dateMatch: "29/03/2026", phase: "F 1" }),
    result("3", { dateMatch: "02/11/2025" }),
    result("4", { dateMatch: "26/04/2026", scores: undefined }),
    result("5", { dateMatch: "31/01/2026", clubB: HAILLAN }),
    result("6", { dateMatch: "à définir" }),
    result("7", { dateMatch: "12/10/2025" }),
    result("8", { dateMatch: "18/10/2025" }),
  ], HAILLAN.id);

  it("lists every match the latest first, the later round first on one day", () => {
    expect(ids(matchesByDate(matches))).toEqual(["4", "2", "1", "5", "3", "8", "7", "6"]);
  });

  it("keeps the five latest scored matches, internal ones included", () => {
    expect(ids(latestResults(matches))).toEqual(["2", "1", "5", "3", "8"]);
  });

  it("returns fewer when the season has fewer scored matches", () => {
    expect(ids(latestResults(matches.slice(0, 2)))).toEqual(["2", "1"]);
    expect(latestResults([])).toEqual([]);
  });
});
