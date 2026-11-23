import type { PlayerRanking, Result } from "@/types/competition";

import { matchTotals, partnerRecords, type PlayerMatch, playerMatches } from "./matches";
import { PUCHEUX_THEO, PUCHEUX_THEO_RESULTS } from "./matches.fixture";
import {
  bestResult,
  clubsBySeason,
  currentClub,
  latestSeason,
  matchSeasons,
  parsePlayerTab,
  pickSeason,
  playerInitials,
  playerTitles,
  seasonLabel,
  setScores,
  specialtyTable,
  teammatesWithoutMatch,
  topOpponents,
  unbreakableScore,
  winPercent,
} from "./profile";
import { PUCHEUX_THEO_RANKINGS } from "./rankings.fixture";
import { buildPlayerStats } from "./stats";

const ME = "066629";
const BORDELAIS = { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" };
const BEGLAIS = { id: "4062", name: "CA BEGLAIS" };
const SEASON_2026 = { id: "502", name: "Championnat CCAPB 2025-2026" };
const SEASON_2025 = { id: "506", name: "Championnat CCAPB 2024-2025" };
const TRINQUET_CREUSE = { id: "143", name: "Trinquet / P.G. Creuse Masculin" };
const TRINQUET_PLEINE = { id: "146", name: "Trinquet / P.G. Pleine Masculin" };
const SERIE_1 = { id: "1573", name: "1ère Série" };
const SERIE_2 = { id: "1574", name: "2ème Série" };

const THEO = { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" };
const JANY = { name: "JANY Alexandre", number: "054123" };
const KEVIN = { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" };

/** A match of ME and JANY against KEVIN alone, won unless overridden. */
function result(id: string, overrides: Partial<Result> = {}): Result {
  return {
    id,
    competition: SEASON_2025,
    specialty: TRINQUET_CREUSE,
    category: SERIE_1,
    dateMatch: "20/10/2024",
    phase: "P 1",
    scores: "15/10 15/12",
    clubA: BORDELAIS,
    clubB: BEGLAIS,
    clubALineup: { player1: JANY, player2: THEO },
    clubBLineup: { player1: KEVIN },
    ...overrides,
  };
}

/** A ranking of ME and JANY for BORDELAIS, a final title unless overridden. */
function ranking(id: string, overrides: Partial<PlayerRanking> = {}): PlayerRanking {
  return {
    id,
    competition: SEASON_2025,
    specialty: TRINQUET_CREUSE,
    category: SERIE_1,
    club: BORDELAIS,
    teamNumber: 1,
    rank: 1,
    phase: "Champion",
    final: true,
    players: [{ licence: ME, name: "PUCHEUX Theo" }, { licence: "054123", name: "JANY Alexandre" }],
    ...overrides,
  };
}

const mine = (results: Result[]) => playerMatches(results, ME);
const ids = (matches: readonly PlayerMatch[]) => matches.map((m) => m.result.id);
const sets = (match: PlayerMatch | null) => setScores(match?.sets ?? null).join(" ");

describe("parsePlayerTab", () => {
  it("reads a known tab", () => {
    expect(parsePlayerTab("matches")).toBe("matches");
    expect(parsePlayerTab("honours")).toBe("honours");
    expect(parsePlayerTab(["honours", "matches"])).toBe("honours");
  });

  it("falls back to the overview", () => {
    expect(parsePlayerTab(undefined)).toBe("overview");
    expect(parsePlayerTab("")).toBe("overview");
    expect(parsePlayerTab("Matches")).toBe("overview");
    expect(parsePlayerTab("stats")).toBe("overview");
  });
});

describe("header", () => {
  it("takes the initials of the first and last words, without suffixes", () => {
    expect(playerInitials("PUCHEUX Theo")).toBe("PT");
    expect(playerInitials("PUCHEUX Theo (E)")).toBe("PT");
    expect(playerInitials("DUFFOUR-NONNON Lucas (D)")).toBe("DL");
    expect(playerInitials("GARCIA Jean jacques")).toBe("GJ");
    expect(playerInitials("etxeberri")).toBe("E");
    expect(playerInitials("(E)")).toBeNull();
    expect(playerInitials(null)).toBeNull();
  });

  it("reads the club of the most recent ranking", () => {
    expect(currentClub([ranking("1", { club: BEGLAIS }), ranking("2")])).toEqual(BEGLAIS);
    expect(currentClub([])).toBeNull();
  });

  it("rounds the win rate to a whole percentage", () => {
    expect(winPercent({ winRate: 29 / 36 })).toBe(81);
    expect(winPercent({ winRate: 1 })).toBe(100);
    expect(winPercent({ winRate: null })).toBeNull();
  });

  it("names a season by its years, or by the competition's name without them", () => {
    expect(seasonLabel(SEASON_2026)).toBe("2025-2026");
    expect(seasonLabel({ name: "Championnat 2018-2019 CCAPB" })).toBe("2018-2019");
    expect(seasonLabel({ name: "Championnat été 2025" })).toBe("Championnat été 2025");
  });
});

describe("latestSeason", () => {
  it("joins each ranking of the latest season to its matches", () => {
    const rankings = [
      ranking("1", { competition: SEASON_2026, rank: 3, phase: "1/2 finale" }),
      ranking("2", {
        competition: SEASON_2026,
        specialty: TRINQUET_PLEINE,
        rank: 8,
        phase: "FORFAIT",
      }),
      ranking("3"),
    ];
    const matches = mine([
      result("1", { competition: SEASON_2026, scores: "15/10 10/15 10/05" }),
      result("2", { competition: SEASON_2026, scores: "10/15 12/15" }),
      result("3", { competition: SEASON_2026, scores: undefined }),
      result("4", { competition: SEASON_2026, category: SERIE_2 }),
      result("5"),
    ]);
    const season = latestSeason(rankings, matches);
    expect(season?.competition).toEqual(SEASON_2026);
    expect(season?.entries).toMatchObject([
      {
        specialty: TRINQUET_CREUSE,
        category: SERIE_1,
        club: BORDELAIS,
        rank: 3,
        phase: "1/2 finale",
        isTitle: false,
        isForfeit: false,
        record: { played: 2, won: 1, lost: 1, setsWon: 2, setsLost: 3 },
      },
      {
        specialty: TRINQUET_PLEINE,
        isTitle: false,
        isForfeit: true,
        record: { played: 0, won: 0, lost: 0, winRate: null },
      },
    ]);
  });

  it("has no record before the matches load, and no season without a ranking", () => {
    expect(latestSeason([ranking("1")], undefined)?.entries[0]).toMatchObject({
      isTitle: true,
      record: null,
    });
    expect(latestSeason([], [])).toBeNull();
  });
});

describe("specialtyTable", () => {
  const stats = (rankings: PlayerRanking[]) => buildPlayerStats(ME, rankings).specialties;

  it("puts the most played first, then the ranked specialties without a match", () => {
    const placeLibre = { id: "2", name: "Place Libre / P.G. Pleine Masculin" };
    const rankings = [
      ranking("1", { specialty: placeLibre, rank: 2, phase: "Finale" }),
      ranking("2", { specialty: TRINQUET_PLEINE, final: false }),
      ranking("3", { rank: 4, phase: "1/2 finale" }),
    ];
    const matches = mine([
      result("1"),
      result("2", { scores: "10/15 12/15" }),
      result("3", { specialty: TRINQUET_PLEINE }),
    ]);
    expect(specialtyTable(rankings, stats(rankings), matches)).toEqual([
      {
        specialty: TRINQUET_CREUSE,
        record: { played: 2, won: 1, lost: 1 },
        best: { bestRank: 4, phase: "1/2 finale", titles: 0 },
      },
      { specialty: TRINQUET_PLEINE, record: { played: 1, won: 1, lost: 0 }, best: null },
      {
        specialty: placeLibre,
        record: { played: 0, won: 0, lost: 0 },
        best: { bestRank: 2, phase: "Finale", titles: 0 },
      },
    ]);
  });

  it("keeps the rankings' order, without records, before the matches load", () => {
    const rankings = [ranking("1", { specialty: TRINQUET_PLEINE }), ranking("2")];
    expect(
      specialtyTable(rankings, stats(rankings), undefined).map((r) => [
        r.specialty.id,
        r.record,
      ]),
    ).toEqual([["146", null], ["143", null]]);
  });
});

describe("bestResult", () => {
  it("reads one title as Champion, several as their count, else the phase", () => {
    expect(bestResult({ bestRank: 1, phase: "Champion", titles: 1 })).toEqual({ kind: "champion" });
    expect(bestResult({ bestRank: 1, phase: "Champion", titles: 2 })).toEqual({
      kind: "titles",
      count: 2,
    });
    expect(bestResult({ bestRank: 4, phase: "1/2 finale", titles: 0 })).toEqual({
      kind: "phase",
      phase: "1/2 finale",
    });
    expect(bestResult(null)).toBeNull();
  });
});

describe("setScores and unbreakableScore", () => {
  it("writes each set from the player's side", () => {
    expect(setScores([{ player: 15, opponent: 8 }, { player: 9, opponent: 10 }]))
      .toEqual(["15-8", "9-10"]);
    expect(setScores(null)).toEqual([]);
  });

  it("joins the sets so a wrapping line never splits them", () => {
    expect(unbreakableScore(["15-8", "15-3"])).toBe("15\u2060-\u20608\u00a015\u2060-\u20603");
    expect(unbreakableScore([])).toBe("");
  });
});

describe("topOpponents", () => {
  it("keeps the most met, then the latest met", () => {
    const matches = mine([
      result("1", { dateMatch: "01/10/2024" }),
      result("2", {
        dateMatch: "02/10/2024",
        clubBLineup: { player1: { name: "CAZAUBON Mattin", number: "067777" } },
      }),
      result("3", { dateMatch: "03/10/2024" }),
    ]);
    expect(topOpponents(matches, 1).map((o) => o.licence)).toEqual(["062002"]);
    expect(topOpponents(matches).map((o) => o.licence)).toEqual(["062002", "067777"]);
  });
});

describe("playerTitles", () => {
  it("finds the final won in the title's competition, specialty and category", () => {
    const rankings = [ranking("1"), ranking("2", { rank: 2 }), ranking("3", { final: false })];
    const matches = mine([
      result("1", { phase: "D 1" }),
      result("2", { phase: "F 1", category: SERIE_2 }),
      result("3", { phase: "F 1", scores: "15/03 15/06" }),
    ]);
    const titles = playerTitles(rankings, matches);
    expect(titles.map((t) => [t.ranking.id, t.final?.result.id])).toEqual([["1", "3"]]);
  });

  it("keeps a title without its final until the matches load or when none is found", () => {
    expect(playerTitles([ranking("1")], undefined)).toEqual([
      { ranking: ranking("1"), final: null },
    ]);
    const lostFinal = mine([result("1", { phase: "F 1", scores: "10/15 12/15" })]);
    expect(playerTitles([ranking("1")], lostFinal)[0].final).toBeNull();
  });
});

describe("clubsBySeason", () => {
  it("lists each season's clubs once, the most recent season first", () => {
    expect(clubsBySeason([
      ranking("1", { competition: SEASON_2026, club: BEGLAIS }),
      ranking("2", { competition: SEASON_2026, club: BORDELAIS }),
      ranking("3", { competition: SEASON_2026, club: BEGLAIS, specialty: TRINQUET_PLEINE }),
      ranking("4"),
    ])).toEqual([
      { competition: SEASON_2026, clubs: [BEGLAIS, BORDELAIS] },
      { competition: SEASON_2025, clubs: [BORDELAIS] },
    ]);
  });
});

describe("matchSeasons and pickSeason", () => {
  it("groups by season, then specialty and category, the latest first", () => {
    const seasons = matchSeasons(mine([
      result("1", { dateMatch: "06/09/2024" }),
      result("2", { dateMatch: "13/10/2025", competition: SEASON_2026, scores: undefined }),
      result("3", { dateMatch: "12/02/2025", specialty: TRINQUET_PLEINE }),
      result("4", { dateMatch: "22/09/2024", scores: "10/15 12/15" }),
      result("5", { dateMatch: "30/09/2024", category: SERIE_2 }),
    ]));
    expect(seasons.map((s) => [s.competition.id, s.record.played, s.record.won, s.record.lost]))
      .toEqual([["502", 0, 0, 0], ["506", 4, 3, 1]]);
    expect(seasons[1].groups.map((g) => [g.key, ids(g.matches), g.record.played])).toEqual([
      ["506/146/1573", ["3"], 1],
      ["506/143/1574", ["5"], 1],
      ["506/143/1573", ["4", "1"], 2],
    ]);
  });

  it("lists a lineup player without a licence, who is in no record", () => {
    const [season] = matchSeasons(mine([
      result("1", { clubBLineup: { player1: { name: "(E)" } } }),
    ]));
    expect(season.groups[0].matches[0].opponents).toEqual([{ name: "(E)", licence: null }]);
  });

  it("picks the season of the param when the player has matches in it", () => {
    const seasons = [{ competition: SEASON_2026 }, { competition: SEASON_2025 }];
    expect(pickSeason(seasons, "506")).toBe("506");
    expect(pickSeason(seasons, ["502"])).toBe("502");
    expect(pickSeason(seasons, "999")).toBeNull();
    expect(pickSeason(seasons, undefined)).toBeNull();
  });
});

describe("PUCHEUX Theo, from Frontis", () => {
  const rankings = PUCHEUX_THEO_RANKINGS;
  const matches = playerMatches(PUCHEUX_THEO_RESULTS, PUCHEUX_THEO);
  const stats = buildPlayerStats(PUCHEUX_THEO, rankings);

  it("heads with Le Haillan, 2 titles, 29-7, 81 % and 4 seasons", () => {
    expect(currentClub(rankings)?.name).toBe("AMIS DE LA PEL.BASQUE-LE HAILLAN");
    expect(stats.totals).toMatchObject({ titles: 2, seasons: 4 });
    const totals = matchTotals(matches);
    expect([totals.won, totals.lost, winPercent(totals)]).toEqual([29, 7, 81]);
  });

  it("wins his two titles in finals 15-1 15-5 and 15-3 15-6", () => {
    const titles = playerTitles(rankings, matches);
    expect(titles.map((t) => [t.ranking.id, t.final?.result.id, sets(t.final)])).toEqual([
      ["75", "9786", "15-1 15-5"],
      ["690", "11533", "15-3 15-6"],
    ]);
    expect(titles.map((t) => t.final?.opponents.map((o) => o.name))).toEqual([
      ["DUFFOUR-NONNON Lucas (D)"],
      ["FEVRIER Mathieu", "SEINDERAIN Gerard (E)"],
    ]);
  });

  it("played with JANY Alexandre and SENDER Timothe, never with three teammates", () => {
    const partners = partnerRecords(matches);
    expect(partners.map((p) => [p.name, p.played, p.won, p.lost])).toEqual([
      ["JANY Alexandre", 24, 18, 6],
      ["SENDER Timothe", 5, 4, 1],
    ]);
    expect(teammatesWithoutMatch(stats.partners, partners).map((t) => t.name)).toEqual([
      "NAVARRINE Olivier",
      "FIGEROU Benedict",
      "GARCIA Antoine",
    ]);
  });

  it("won his seven matches of 2025-2026, 14 sets to 1", () => {
    const season = latestSeason(rankings, matches);
    expect(seasonLabel(season!.competition)).toBe("2025-2026");
    expect(season?.entries).toHaveLength(1);
    expect(season?.entries[0]).toMatchObject({
      specialty: { id: "136" },
      club: { id: "4063" },
      phase: "Champion",
      isTitle: true,
      record: { played: 7, won: 7, lost: 0, setsWon: 14, setsLost: 1 },
    });
  });

  it("records each specialty with its best final rank", () => {
    expect(
      specialtyTable(rankings, stats.specialties, matches).map((row) => [
        row.specialty.id,
        row.record?.played,
        row.record?.won,
        row.record?.lost,
        row.best?.bestRank,
        row.best?.titles,
      ]),
    ).toEqual([
      ["143", 19, 17, 2, 1, 1],
      ["146", 10, 5, 5, 4, 0],
      ["136", 7, 7, 0, 1, 1],
    ]);
  });

  it("met CAZAUBON Mattin, GONZALEZ Antoine and SEINDERAIN Gerard most", () => {
    expect(topOpponents(matches).map((o) => [o.name, o.played, o.won, o.lost])).toEqual([
      ["CAZAUBON Mattin", 4, 4, 0],
      ["GONZALEZ Antoine", 4, 2, 2],
      ["SEINDERAIN Gerard (E)", 4, 4, 0],
      ["GARCIA Antoine", 3, 3, 0],
      ["NICOL Guillaume", 3, 1, 2],
    ]);
  });

  it("played for three clubs over four seasons", () => {
    expect(clubsBySeason(rankings).map((s) => [s.competition.id, s.clubs.map((c) => c.id)]))
      .toEqual([["502", ["4063"]], ["506", ["4132"]], ["507", ["4132"]], ["517", ["4062"]]]);
  });

  it("lists his matches by season, the Pleine matches of 2024-2025 first", () => {
    const seasons = matchSeasons(matches);
    expect(seasons.map((s) => [s.competition.id, s.record.won, s.record.lost])).toEqual([
      ["502", 7, 0],
      ["506", 11, 6],
      ["507", 7, 0],
      ["517", 4, 1],
    ]);
    expect(seasons[1].groups.map((g) => [g.key, g.matches.length])).toEqual([
      ["506/146/1573", 10],
      ["506/143/1573", 7],
    ]);
  });
});
