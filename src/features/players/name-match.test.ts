import type { TeamRanking } from "@/types/competition";

import { findPlayers, matchesName, nameKey, searchWords } from "./name-match";

function team(id: string, overrides: Partial<TeamRanking> = {}): TeamRanking {
  return {
    id,
    club: { id, name: `Club ${id}` },
    teamNumber: 1,
    rank: 1,
    phase: "Champion",
    final: true,
    players: [],
    ...overrides,
  };
}

describe("nameKey", () => {
  it("drops accents and case", () => {
    expect(nameKey("Étienne IBÁÑEZ")).toBe("ETIENNE IBANEZ");
  });

  it("turns punctuation into spaces, like Frontis", () => {
    expect(nameKey(" D'ARCANGUES  Jean-Peio ")).toBe("D ARCANGUES JEAN PEIO");
  });
});

describe("searchWords", () => {
  it("splits the query into normalised words", () => {
    expect(searchWords("  ane   Etxeberri ")).toEqual(["ANE", "ETXEBERRI"]);
  });

  it("drops words shorter than two characters", () => {
    expect(searchWords("j etxeberri")).toEqual(["ETXEBERRI"]);
  });

  it.each(["", "   ", "a", "a b", "a.b", "é-a"])(
    "finds no searchable word in %p, which Frontis rejects",
    (query) => {
      expect(searchWords(query)).toEqual([]);
    },
  );
});

describe("matchesName", () => {
  const words = (query: string) => searchWords(query);

  it("ignores case, accents and word order", () => {
    expect(matchesName("ETXEBERRI Ane", words("ane etxeberri"))).toBe(true);
    expect(matchesName("DUPONT Étienne", words("etienne DUPONT"))).toBe(true);
  });

  it("matches each word as a substring, not a whole word", () => {
    expect(matchesName("DUPONT Étienne", words("et"))).toBe(true);
    expect(matchesName("ETXEBERRI Ane", words("txeber"))).toBe(true);
  });

  it("needs every word to match", () => {
    expect(matchesName("ETXEBERRI Ane", words("etxeberri mikel"))).toBe(false);
  });

  it("does not match across the spaces punctuation leaves", () => {
    expect(matchesName("D'ARCANGUES Peio", words("arcangues"))).toBe(true);
    expect(matchesName("D'ARCANGUES Peio", words("d'arcangues"))).toBe(true);
    expect(matchesName("D'ARCANGUES Peio", words("darcangues"))).toBe(false);
  });

  it("never matches a missing name or a query with no searchable word", () => {
    expect(matchesName(null, words("ane"))).toBe(false);
    expect(matchesName("ETXEBERRI Ane", words("a"))).toBe(false);
  });
});

describe("findPlayers", () => {
  it("keeps only the matching players, not their team-mates", () => {
    const players = findPlayers([
      team("1", {
        players: [
          { licence: "000101", name: "ETXEBERRI Ane" },
          { licence: "000202", name: "IRIGOIEN Mikel" },
        ],
      }),
    ], "etxeberri");
    expect(players).toEqual([
      { licence: "000101", name: "ETXEBERRI Ane", club: { id: "1", name: "Club 1" } },
    ]);
  });

  it("lists a player once, with the club of their most recent ranking", () => {
    const players = findPlayers([
      team("2", { players: [{ licence: "000101", name: null }] }),
      team("1", { players: [{ licence: "000101", name: "ETXEBERRI Ane" }] }),
      team("1", { players: [{ licence: "000101", name: "ETXEBERRI Ane" }] }),
    ], "ane");
    expect(players).toEqual([
      { licence: "000101", name: "ETXEBERRI Ane", club: { id: "2", name: "Club 2" } },
    ]);
  });

  it("keeps players who share a name apart by licence, sorted by name", () => {
    const players = findPlayers([
      team("1", {
        players: [
          { licence: "000303", name: "ETXEBERRI Mikel" },
          { licence: "000101", name: " ETXEBERRI Ane " },
        ],
      }),
      team("2", { players: [{ licence: "000404", name: "ÉTXEBERRI Ane" }] }),
    ], "etxeberri");
    expect(players.map((p) => [p.licence, p.name])).toEqual([
      ["000101", "ETXEBERRI Ane"],
      ["000404", "ÉTXEBERRI Ane"],
      ["000303", "ETXEBERRI Mikel"],
    ]);
  });

  it("skips players with no name", () => {
    const players = findPlayers([
      team("1", { players: [{ licence: "000101", name: null }, { licence: "000202", name: " " }] }),
    ], "ane");
    expect(players).toEqual([]);
  });

  it("finds nobody for a query with no searchable word", () => {
    const players = findPlayers([
      team("1", { players: [{ licence: "000101", name: "ETXEBERRI Ane" }] }),
    ], "a");
    expect(players).toEqual([]);
  });
});
