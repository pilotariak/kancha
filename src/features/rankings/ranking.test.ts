import type { TeamRanking } from "@/types/competition";

import { buildRanking, isForfeit } from "./ranking";

/** Build a ranking line; `id` doubles as the club id so each team stays distinct. */
function team(id: string, overrides: Partial<TeamRanking> = {}): TeamRanking {
  return {
    id,
    club: { id, name: `Club ${id}` },
    teamNumber: 1,
    rank: Number(id),
    phase: "Poules",
    final: true,
    players: [
      { licence: `00${id}01`, name: `PLAYER${id} One` },
      { licence: `00${id}02`, name: `PLAYER${id} Two` },
    ],
    ...overrides,
  };
}

describe("buildRanking", () => {
  it("returns an empty view when the league publishes no ranking", () => {
    expect(buildRanking([])).toEqual({ status: "empty", rows: [] });
  });

  it("maps each team to a row with club, team number, phase and players", () => {
    const { rows } = buildRanking([team("1", { teamNumber: 2, phase: "Champion" })]);
    expect(rows).toEqual([
      {
        id: "1",
        rank: 1,
        clubName: "Club 1",
        teamNumber: 2,
        phase: "Champion",
        isChampion: true,
        isForfeit: false,
        players: [
          { licence: "00101", name: "PLAYER1 One" },
          { licence: "00102", name: "PLAYER1 Two" },
        ],
      },
    ]);
  });

  it("crowns the rank-1 team of a final ranking, and only that team", () => {
    const view = buildRanking([
      team("1", { phase: "Champion" }),
      team("2", { phase: "Finale" }),
      team("3", { phase: "1/2 finale" }),
    ]);
    expect(view.status).toBe("final");
    expect(view.rows.map((r) => r.isChampion)).toEqual([true, false, false]);
  });

  it("marks a running championship as provisional with no champion", () => {
    const view = buildRanking([
      team("1", { final: false, phase: "Finale" }),
      team("2", { final: false, phase: "Finale" }),
    ]);
    expect(view.status).toBe("provisional");
    expect(view.rows.some((r) => r.isChampion)).toBe(false);
  });

  it("stays provisional when any row is not final", () => {
    const view = buildRanking([team("1"), team("2", { final: false })]);
    expect(view.status).toBe("provisional");
    expect(view.rows[0].isChampion).toBe(false);
  });

  it("orders rows by rank and keeps tied teams in the API order", () => {
    const view = buildRanking([
      team("4", { rank: 3 }),
      team("2"),
      team("3", { rank: 3 }),
      team("1"),
    ]);
    expect(view.rows.map((r) => r.id)).toEqual(["1", "2", "4", "3"]);
  });

  it("keeps a null player name null so the screen can show the licence", () => {
    const { rows } = buildRanking([
      team("1", {
        players: [
          { licence: "000101", name: null },
          { licence: "000102", name: "   " },
          { licence: "000103", name: " ETXEBERRI Ane " },
        ],
      }),
    ]);
    expect(rows[0].players).toEqual([
      { licence: "000101", name: null },
      { licence: "000102", name: null },
      { licence: "000103", name: "ETXEBERRI Ane" },
    ]);
  });

  it("passes unknown phase text through unchanged", () => {
    const { rows } = buildRanking([team("1", { phase: "Barrage 1er tour" })]);
    expect(rows[0].phase).toBe("Barrage 1er tour");
  });
});

describe("isForfeit", () => {
  it.each(["FORFAIT", "Forfait", " FORFAIT ", "Forfait général"])("flags %p", (phase) => {
    expect(isForfeit(phase)).toBe(true);
  });

  it.each(["Champion", "Finale", "1/2 finale", "1/4 de finale", "Barrage 1er tour", "Poules"])(
    "does not flag %p",
    (phase) => {
      expect(isForfeit(phase)).toBe(false);
    },
  );
});
