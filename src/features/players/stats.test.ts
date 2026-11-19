import type { PlayerRanking } from "@/types/competition";

import { buildPlayerStats } from "./stats";

const ME = "000101";
const PARTNER = "000202";

/** A ranking of player ME, won with PARTNER, in the most recent season unless overridden. */
function ranking(id: string, overrides: Partial<PlayerRanking> = {}): PlayerRanking {
  return {
    id,
    competition: { id: "7", name: "Championnat 2025-2026" },
    specialty: { id: "1", name: "Trinquet / Main nue" },
    category: { id: "1", name: "1ère Série" },
    club: { id: "1", name: "Club Ane" },
    teamNumber: 1,
    rank: 1,
    phase: "Champion",
    final: true,
    players: [
      { licence: ME, name: "ETXEBERRI Ane" },
      { licence: PARTNER, name: "IRIGOIEN Mikel" },
    ],
    ...overrides,
  };
}

const SEASON_2026 = { id: "7", name: "Championnat 2025-2026" };
const SEASON_2025 = { id: "31", name: "Championnat 2024-2025" };
const SEASON_2024 = { id: "12", name: "Championnat 2023-2024" };

describe("buildPlayerStats", () => {
  it("returns empty stats for a licence with no ranking", () => {
    expect(buildPlayerStats(ME, [])).toEqual({
      name: null,
      clubs: [],
      totals: { titles: 0, runnerUps: 0, seasons: 0, rankings: 0 },
      specialties: [],
      partners: [],
      seasons: [],
    });
  });

  it("counts titles and runner-up places from final rankings only", () => {
    const { totals } = buildPlayerStats(ME, [
      ranking("1", { rank: 1 }),
      ranking("2", { rank: 2, phase: "Finale" }),
      ranking("3", { rank: 2, phase: "Finale" }),
      ranking("4", { rank: 1, final: false, phase: "Finale" }),
      ranking("5", { rank: 2, final: false, phase: "Finale" }),
      ranking("6", { rank: 3, phase: "1/2 finale" }),
    ]);
    expect(totals).toEqual({ titles: 1, runnerUps: 2, seasons: 1, rankings: 6 });
  });

  it("reads the rank and the final flag, never the phase text", () => {
    const { totals } = buildPlayerStats(ME, [
      ranking("1", { rank: 1, phase: "Barrage 1er tour" }),
      ranking("2", { rank: 3, phase: "Champion" }),
    ]);
    expect(totals.titles).toBe(1);
  });

  it("counts seasons as distinct competitions, provisional ones included", () => {
    const { totals } = buildPlayerStats(ME, [
      ranking("1", { competition: SEASON_2026, final: false }),
      ranking("2", { competition: SEASON_2025 }),
      ranking("3", { competition: SEASON_2025, specialty: { id: "2", name: "Place libre" } }),
      ranking("4", { competition: SEASON_2024 }),
    ]);
    expect(totals.seasons).toBe(3);
    expect(totals.rankings).toBe(4);
  });

  it("gives the best final rank per specialty with its titles, best first", () => {
    const trinquet = { id: "1", name: "Trinquet / Main nue" };
    const placeLibre = { id: "2", name: "Place libre / Grand chistera" };
    const mur = { id: "3", name: "Mur à gauche / Pala corta" };
    const fronton = { id: "4", name: "Fronton / Xare" };
    const { specialties } = buildPlayerStats(ME, [
      ranking("1", { specialty: trinquet, rank: 3 }),
      ranking("2", { specialty: mur, rank: 2 }),
      ranking("3", { specialty: placeLibre, rank: 2 }),
      ranking("4", { specialty: placeLibre, rank: 1, competition: SEASON_2025 }),
      ranking("5", { specialty: placeLibre, rank: 1, competition: SEASON_2024 }),
      ranking("6", { specialty: trinquet, rank: 1, final: false, competition: SEASON_2024 }),
      ranking("7", { specialty: fronton, rank: 1, final: false }),
    ]);
    expect(specialties).toEqual([
      { specialty: placeLibre, bestRank: 1, titles: 2 },
      { specialty: mur, bestRank: 2, titles: 0 },
      { specialty: trinquet, bestRank: 3, titles: 0 },
    ]);
  });

  it("leaves out a specialty with provisional rankings only", () => {
    const { specialties } = buildPlayerStats(ME, [ranking("1", { final: false })]);
    expect(specialties).toEqual([]);
  });

  it("counts partners, most frequent first, then most recent first", () => {
    const { partners } = buildPlayerStats(ME, [
      ranking("1", {
        players: [
          { licence: "000303", name: "BERGARA Jon" },
          { licence: ME, name: "ETXEBERRI Ane" },
        ],
      }),
      ranking("2", { competition: SEASON_2025 }),
      ranking("3", {
        competition: SEASON_2025,
        final: false,
        players: [
          { licence: ME, name: "ETXEBERRI Ane" },
          { licence: "000404", name: "ZUBIRI Maite" },
          { licence: "000303", name: "BERGARA Jon" },
        ],
      }),
      ranking("4", { competition: SEASON_2024 }),
      ranking("5", {
        competition: SEASON_2024,
        players: [
          { licence: ME, name: "ETXEBERRI Ane" },
          { licence: "000505", name: "LARRALDE Peio" },
        ],
      }),
    ]);
    expect(partners).toEqual([
      { licence: "000303", name: "BERGARA Jon", count: 2 },
      { licence: PARTNER, name: "IRIGOIEN Mikel", count: 2 },
      { licence: "000404", name: "ZUBIRI Maite", count: 1 },
      { licence: "000505", name: "LARRALDE Peio", count: 1 },
    ]);
  });

  it("names a partner from any ranking that does", () => {
    const { partners } = buildPlayerStats(ME, [
      ranking("1", {
        players: [{ licence: ME, name: "ETXEBERRI Ane" }, { licence: PARTNER, name: null }],
      }),
      ranking("2", {
        players: [{ licence: ME, name: "ETXEBERRI Ane" }, { licence: PARTNER, name: "  " }],
      }),
      ranking("3", { competition: SEASON_2025 }),
    ]);
    expect(partners).toEqual([{ licence: PARTNER, name: "IRIGOIEN Mikel", count: 3 }]);
  });

  it("takes the player's name from the most recent ranking that has one", () => {
    const stats = buildPlayerStats(ME, [
      ranking("1", { players: [{ licence: ME, name: null }] }),
      ranking("2", { players: [{ licence: ME, name: " ETXEBERRI Ane " }] }),
      ranking("3", { players: [{ licence: ME, name: "ETXEBERRY Ane" }] }),
    ]);
    expect(stats.name).toBe("ETXEBERRI Ane");
  });

  it("keeps the name null when no ranking names the player", () => {
    const stats = buildPlayerStats(ME, [
      ranking("1", { players: [{ licence: ME, name: null }] }),
      ranking("2", { players: [{ licence: ME, name: "   " }] }),
    ]);
    expect(stats.name).toBeNull();
  });

  it("keeps leading zeros and ignores spaces around the licence", () => {
    const stats = buildPlayerStats(` ${ME} `, [ranking("1")]);
    expect(stats.name).toBe("ETXEBERRI Ane");
    expect(stats.partners.map((p) => p.licence)).toEqual([PARTNER]);
  });

  it("lists clubs once each, most recent first", () => {
    const { clubs } = buildPlayerStats(ME, [
      ranking("1", { club: { id: "2", name: "Club Berri" } }),
      ranking("2", { club: { id: "2", name: "Club Berri" }, competition: SEASON_2025 }),
      ranking("3", { club: { id: "1", name: "Club Ane" }, competition: SEASON_2025 }),
      ranking("4", { club: { id: "2", name: "Club Berri" }, competition: SEASON_2024 }),
    ]);
    expect(clubs).toEqual([{ id: "2", name: "Club Berri" }, { id: "1", name: "Club Ane" }]);
  });

  it("groups the history by season in API order, not by competition id", () => {
    const { seasons } = buildPlayerStats(ME, [
      ranking("1", { competition: SEASON_2026 }),
      ranking("2", { competition: SEASON_2025 }),
      ranking("3", { competition: SEASON_2025, specialty: { id: "2", name: "Place libre" } }),
      ranking("4", { competition: SEASON_2024 }),
    ]);
    expect(seasons.map((s) => s.competition)).toEqual([SEASON_2026, SEASON_2025, SEASON_2024]);
    expect(seasons.map((s) => s.rankings.map((r) => r.id))).toEqual([["1"], ["2", "3"], ["4"]]);
  });

  it("describes each ranking of the history, provisional ones included", () => {
    const { seasons } = buildPlayerStats(ME, [
      ranking("1", {
        rank: 1,
        final: false,
        phase: "Finale",
        category: { id: "2", name: "2ème Série" },
        players: [{ licence: ME, name: "ETXEBERRI Ane" }, { licence: PARTNER, name: " " }],
      }),
      ranking("2", { rank: 5, phase: "FORFAIT" }),
    ]);
    expect(seasons[0].rankings).toEqual([
      {
        id: "1",
        specialtyName: "Trinquet / Main nue",
        categoryName: "2ème Série",
        clubName: "Club Ane",
        rank: 1,
        phase: "Finale",
        final: false,
        isTitle: false,
        isForfeit: false,
        partners: [{ licence: PARTNER, name: null }],
      },
      {
        id: "2",
        specialtyName: "Trinquet / Main nue",
        categoryName: "1ère Série",
        clubName: "Club Ane",
        rank: 5,
        phase: "FORFAIT",
        final: true,
        isTitle: false,
        isForfeit: true,
        partners: [{ licence: PARTNER, name: "IRIGOIEN Mikel" }],
      },
    ]);
  });
});
