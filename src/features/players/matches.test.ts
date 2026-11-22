import { matchesByDate } from "@/features/clubs/club";
import type { PlayerRanking, Result } from "@/types/competition";

import {
  currentStreak,
  finalsRecord,
  matchTotals,
  opponentRecords,
  partnerRecords,
  playerForm,
  playerMatches,
  rankingClubCompetitions,
  seasonRecords,
  specialtyRecords,
} from "./matches";
import { PUCHEUX_THEO, PUCHEUX_THEO_RESULTS } from "./matches.fixture";

// Clubs, players and numbers from Frontis (lcapb): PUCHEUX Theo plays for Le Trinquet Bordelais
// with JANY Alexandre, and meets PUCHEUX Kevin and GUILLENTEGUY Patxi of CA Béglais.
const ME = "066629";
const BORDELAIS = { id: "4132", name: "ASSOCIATION LE TRINQUET BORDELAIS" };
const BEGLAIS = { id: "4062", name: "CA BEGLAIS" };
const HAILLAN = { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" };
const SEASON_2025 = { id: "506", name: "Championnat CCAPB 2024-2025" };
const TRINQUET_CREUSE = { id: "143", name: "Trinquet / P.G. Creuse Masculin" };
const TRINQUET_PLEINE = { id: "146", name: "Trinquet / P.G. Pleine Masculin" };
const SERIE_1 = { id: "1573", name: "1ère Série" };

const THEO = { name: "PUCHEUX Theo (E)", number: "066629 - 01-330-055" };
const JANY = { name: "JANY Alexandre", number: "054123" };
const NAVARRINE = { name: "NAVARRINE Olivier", number: "022738" };
const KEVIN = { name: "PUCHEUX Kevin (E)", number: "062002 - 01-642-063" };
const PATXI = { name: "GUILLENTEGUY Patxi", number: "050292" };

/** A match of ME and JANY, on side A, against KEVIN and PATXI, won unless overridden. */
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
    clubBLineup: { player1: KEVIN, player2: PATXI },
    ...overrides,
  };
}

const mine = (results: Result[]) => playerMatches(results, ME);
const ids = (matches: { result: Result }[]) => matches.map((m) => m.result.id);

describe("rankingClubCompetitions", () => {
  // The five rankings of PUCHEUX Theo: two of them, in two specialties, for one club and season.
  const ranking = (clubId: string, competitionId: string, licences: string[]) =>
    ({
      club: { id: clubId, name: "" },
      competition: { id: competitionId, name: "" },
      players: licences.map((licence) => ({ licence, name: null })),
    }) satisfies Pick<PlayerRanking, "club" | "competition" | "players">;

  it("takes each club and competition of the rankings once, teams of three included", () => {
    expect(rankingClubCompetitions([
      ranking("4063", "502", ["066629"]),
      ranking("4132", "506", ["054123", "066629"]),
      ranking("4132", "506", ["054123", "066629", "022738"]),
      ranking("4132", "507", ["054123", "066629", "103493"]),
      ranking("4062", "517", ["066629", "073197", "073842"]),
    ])).toEqual([
      { clubId: "4063", competitionId: "502" },
      { clubId: "4132", competitionId: "506" },
      { clubId: "4132", competitionId: "507" },
      { clubId: "4062", competitionId: "517" },
    ]);
  });

  it("is empty without rankings", () => {
    expect(rankingClubCompetitions([])).toEqual([]);
  });
});

describe("playerMatches", () => {
  it("finds the licence behind a club code, and never by name", () => {
    const matches = mine([
      result("1"),
      result("2", { clubALineup: { player1: JANY, player2: { ...THEO, number: "099999" } } }),
      result("3", { clubALineup: { player1: JANY, player2: { ...THEO, number: "0666291" } } }),
      result("4", { clubALineup: undefined, clubBLineup: undefined }),
    ]);
    expect(ids(matches)).toEqual(["1"]);
  });

  it("reads the match from the player's side, their points first", () => {
    const [match] = mine([
      result("10888", {
        phase: "B2T 1",
        scores: "15/07 11/15 10/09",
        clubA: BEGLAIS,
        clubB: BORDELAIS,
        clubALineup: { player1: KEVIN, player2: PATXI },
        clubBLineup: { player1: JANY, player2: THEO },
      }),
    ]);
    expect(match).toMatchObject({
      side: "B",
      outcome: "lost",
      club: BORDELAIS,
      opponentClub: BEGLAIS,
      partners: [{ name: "JANY Alexandre", licence: "054123" }],
      opponents: [
        { name: "PUCHEUX Kevin (E)", licence: "062002" },
        { name: "GUILLENTEGUY Patxi", licence: "050292" },
      ],
      sets: [
        { player: 7, opponent: 15 },
        { player: 15, opponent: 11 },
        { player: 9, opponent: 10 },
      ],
    });
  });

  it("plays singles without a partner", () => {
    const [match] = mine([
      result("9764", {
        scores: "09/15 15/10 02/10",
        clubALineup: { player1: { name: "GONZALEZ Antoine", number: "058964" } },
        clubBLineup: { player1: { name: "PUCHEUX Theo", number: ME } },
      }),
    ]);
    expect(match).toMatchObject({
      side: "B",
      outcome: "won",
      partners: [],
      opponents: [{ name: "GONZALEZ Antoine", licence: "058964" }],
    });
  });

  it("takes the lineup's side in a match between two teams of one club", () => {
    const [match] = mine([
      result("1", {
        phase: "F 1",
        scores: "15/01 15/05",
        clubA: HAILLAN,
        clubB: HAILLAN,
        clubALineup: { player1: { name: "DUFFOUR-NONNON Lucas (D)", number: "096222" } },
        clubBLineup: { player1: THEO },
      }),
    ]);
    expect(match).toMatchObject({
      side: "B",
      outcome: "lost",
      club: HAILLAN,
      opponentClub: HAILLAN,
    });
  });

  it("leaves out the matches of the player's ranking team of three played without them", () => {
    const matches = mine([
      result("1", { clubALineup: { player1: JANY, player2: NAVARRINE } }),
      result("2"),
    ]);
    expect(ids(matches)).toEqual(["2"]);
    expect(partnerRecords(matches).map((p) => p.licence)).toEqual(["054123"]);
  });

  it("marks matches without a score as unscored, and level sets as even", () => {
    const matches = mine([
      result("1", { scores: undefined }),
      result("2", { scores: "" }),
      result("3", { scores: "F/15" }),
      result("4", { scores: "15/10 10/15" }),
    ]);
    expect(matches.map((m) => m.outcome)).toEqual(["unscored", "unscored", "unscored", "even"]);
    expect(matches[0].sets).toBeNull();
    expect(matches[3].sets).toEqual([{ player: 15, opponent: 10 }, { player: 10, opponent: 15 }]);
  });
});

describe("matchTotals", () => {
  it("counts the matches with a score, level ones as played, and every set won or lost", () => {
    const totals = matchTotals(mine([
      result("1", { scores: "15/10 15/12" }),
      result("2", { scores: "10/15 15/12 05/10" }),
      result("3", { scores: "15/10 10/15 10/10" }),
      result("4", { scores: undefined }),
    ]));
    expect(totals).toEqual({
      played: 3,
      won: 1,
      lost: 1,
      winRate: 1 / 3,
      setsWon: 4,
      setsLost: 3,
    });
  });

  it("has no win rate before a match is played", () => {
    expect(matchTotals(mine([result("1", { scores: undefined })]))).toEqual({
      played: 0,
      won: 0,
      lost: 0,
      winRate: null,
      setsWon: 0,
      setsLost: 0,
    });
  });
});

describe("finalsRecord", () => {
  it("counts the finals with a score", () => {
    expect(finalsRecord(mine([
      result("1", { phase: "F 1" }),
      result("2", { phase: "F 1", scores: "10/15 12/15" }),
      result("3", { phase: "F 1", scores: undefined }),
      result("4", { phase: "D 1" }),
    ]))).toEqual({ played: 2, won: 1, lost: 1 });
  });
});

describe("playerForm and currentStreak", () => {
  const WON = "15/10 15/12";
  const LOST = "10/15 12/15";

  it("puts the oldest first and, on one day, the later round last", () => {
    const matches = mine([
      result("3", { dateMatch: "17/01/2026", phase: "P 3", scores: LOST }),
      result("2", { dateMatch: "17/01/2026", phase: "P 2", scores: WON }),
      result("5", { dateMatch: "28/02/2026", phase: "F 1", scores: LOST }),
      result("4", { dateMatch: "28/02/2026", phase: "D 1", scores: WON }),
    ]);
    expect(playerForm(matches)).toEqual(["W", "L", "W", "L"]);
  });

  it("keeps the last ten results", () => {
    const matches = mine(
      Array.from({ length: 12 }, (_, i) =>
        result(String(i + 1), {
          dateMatch: `${String(i + 1).padStart(2, "0")}/10/2024`,
          scores: i < 2 ? LOST : WON,
        })),
    );
    expect(playerForm(matches)).toEqual(Array(10).fill("W"));
    expect(playerForm(matches, 12)).toEqual(["L", "L", ...Array(10).fill("W")]);
  });

  it("reads the run that ends with the latest result, skipping level and unscored matches", () => {
    const matches = mine([
      result("1", { dateMatch: "01/10/2024", scores: WON }),
      result("2", { dateMatch: "02/10/2024", scores: LOST }),
      result("3", { dateMatch: "03/10/2024", scores: LOST }),
      result("4", { dateMatch: "04/10/2024", scores: "15/10 10/15" }),
      result("5", { dateMatch: "05/10/2024", scores: LOST }),
      result("6", { dateMatch: "06/10/2024", scores: undefined }),
    ]);
    expect(playerForm(matches)).toEqual(["W", "L", "L", "L"]);
    expect(currentStreak(matches)).toEqual({ result: "L", count: 3 });
  });

  it("has no streak before a match has a winner", () => {
    expect(currentStreak([])).toBeNull();
    expect(currentStreak(mine([result("1", { scores: "15/10 10/15" })]))).toBeNull();
    expect(playerForm([])).toEqual([]);
  });
});

describe("seasonRecords and specialtyRecords", () => {
  // Competition ids are not chronological: neither their number nor their text orders seasons.
  const LATEST = { id: "31", name: "Championnat 2025-2026" };
  const MIDDLE = { id: "7", name: "Championnat 2024-2025" };
  const OLDEST = { id: "120", name: "Championnat 2023-2024" };

  it("orders the seasons by their latest match and counts the matches with a score", () => {
    const seasons = seasonRecords(mine([
      result("1", { competition: MIDDLE, dateMatch: "12/02/2025" }),
      result("2", { competition: OLDEST, dateMatch: "24/09/2023", scores: "10/15 12/15" }),
      result("3", { competition: LATEST, dateMatch: "17/01/2026" }),
      result("4", { competition: MIDDLE, dateMatch: "22/09/2024", scores: "10/15 12/15" }),
      result("5", { competition: LATEST, dateMatch: "07/03/2026", scores: undefined }),
    ]));
    expect(seasons).toEqual([
      { competition: LATEST, played: 1, won: 1, lost: 0 },
      { competition: MIDDLE, played: 2, won: 1, lost: 1 },
      { competition: OLDEST, played: 1, won: 0, lost: 1 },
    ]);
  });

  it("puts the most played specialty first", () => {
    const specialties = specialtyRecords(mine([
      result("1", { specialty: TRINQUET_PLEINE, dateMatch: "12/02/2025" }),
      result("2", { specialty: TRINQUET_CREUSE, dateMatch: "22/09/2024" }),
      result("3", { specialty: TRINQUET_CREUSE, dateMatch: "09/10/2024", scores: "10/15 12/15" }),
    ]));
    expect(specialties).toEqual([
      { specialty: TRINQUET_CREUSE, played: 2, won: 1, lost: 1 },
      { specialty: TRINQUET_PLEINE, played: 1, won: 1, lost: 0 },
    ]);
  });
});

describe("partnerRecords and opponentRecords", () => {
  it("keys players by licence, named as in their latest match", () => {
    const matches = mine([
      result("1", { dateMatch: "11/11/2024", scores: "10/15 12/15" }),
      result("2", {
        dateMatch: "23/02/2025",
        clubALineup: { player1: { ...JANY, name: "JANY Alexandre (E)" }, player2: THEO },
        clubBLineup: { player1: { ...KEVIN, name: "PUCHEUX Kevin" }, player2: PATXI },
      }),
      result("3", {
        dateMatch: "28/02/2025",
        clubBLineup: { player1: { name: "CAZAUBON Mattin", number: "067777" }, player2: PATXI },
      }),
      result("4", { dateMatch: "01/03/2025", scores: undefined }),
    ]);

    expect(partnerRecords(matches)).toEqual([
      { licence: "054123", name: "JANY Alexandre", played: 3, won: 2, lost: 1 },
    ]);
    const opponents = opponentRecords(matches);
    expect(opponents.map(({ last, ...record }) => ({ ...record, last: last.result.id }))).toEqual([
      { licence: "050292", name: "GUILLENTEGUY Patxi", played: 3, won: 2, lost: 1, last: "3" },
      { licence: "062002", name: "PUCHEUX Kevin", played: 2, won: 1, lost: 1, last: "2" },
      { licence: "067777", name: "CAZAUBON Mattin", played: 1, won: 1, lost: 0, last: "3" },
    ]);
  });

  it("leaves out lineup players without a licence", () => {
    const matches = mine([
      result("1", { clubBLineup: { player1: { name: "(E)" }, player2: PATXI } }),
    ]);
    expect(opponentRecords(matches).map((o) => o.licence)).toEqual(["050292"]);
  });
});

describe("PUCHEUX Theo, from Frontis", () => {
  const matches = playerMatches(PUCHEUX_THEO_RESULTS, PUCHEUX_THEO);

  it("finds his 36 matches among his clubs' results", () => {
    expect(PUCHEUX_THEO_RESULTS).toHaveLength(40);
    expect(matches).toHaveLength(36);
    const decoys = ["9771", "11552", "12904", "13056"];
    expect(ids(matches).filter((id) => decoys.includes(id))).toEqual([]);
  });

  it("reads 29 wins, 7 losses, sets 55-14 and two finals won of two", () => {
    expect(matchTotals(matches)).toEqual({
      played: 36,
      won: 29,
      lost: 7,
      winRate: 29 / 36,
      setsWon: 55,
      setsLost: 14,
    });
    expect(finalsRecord(matches)).toEqual({ played: 2, won: 2, lost: 0 });
  });

  it("ends on seven wins, the semi-final of 28/02/2026 before the final", () => {
    expect(currentStreak(matches)).toEqual({ result: "W", count: 7 });
    expect(playerForm(matches)).toEqual(["W", "L", "L", "W", "W", "W", "W", "W", "W", "W"]);
    expect(ids(matchesByDate(matches).slice(0, 2))).toEqual(["9786", "9784"]);
  });

  it("records each season and specialty", () => {
    expect(seasonRecords(matches).map((s) => [s.competition.id, s.played, s.won, s.lost])).toEqual([
      ["502", 7, 7, 0],
      ["506", 17, 11, 6],
      ["507", 7, 7, 0],
      ["517", 5, 4, 1],
    ]);
    expect(specialtyRecords(matches).map((s) => [s.specialty.id, s.played, s.won, s.lost]))
      .toEqual([
        ["143", 19, 17, 2],
        ["146", 10, 5, 5],
        ["136", 7, 7, 0],
      ]);
  });

  it("played 24 matches with JANY Alexandre, and lost three of three to PUCHEUX Kevin", () => {
    expect(partnerRecords(matches)[0]).toEqual({
      licence: "054123",
      name: "JANY Alexandre",
      played: 24,
      won: 18,
      lost: 6,
    });
    const kevin = opponentRecords(matches).find((o) => o.licence === "062002");
    expect(kevin).toMatchObject({ name: "PUCHEUX Kevin (E)", played: 3, won: 0, lost: 3 });
    expect(kevin?.last.result.id).toBe("10988");
  });
});
