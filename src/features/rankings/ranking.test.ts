import { createInstance, type TFunction } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";
import type { ClubLineup, TeamRanking } from "@/types/competition";

import {
  buildRanking,
  buildTeamRecords,
  formLabel,
  type FormResult,
  isForfeit,
  lineupLicence,
  phaseLabel,
  type RankingRow,
  type RecordMatch,
  rowLabel,
} from "./ranking";

const LOCALES = { en, es, eu, fr } as const;

async function translator(lng: keyof typeof LOCALES): Promise<TFunction> {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { [lng]: { translation: LOCALES[lng] } },
    interpolation: { escapeValue: false },
  });
  return i18n.getFixedT(lng);
}

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

// ─── Record and form ──────────────────────────────────────────────────────────

/** A ranked team with these licences. */
function ranked(id: string, ...licences: string[]): Pick<TeamRanking, "id" | "players"> {
  return { id, players: licences.map((licence) => ({ licence, name: `PLAYER ${licence}` })) };
}

/** A lineup of these `number`s, under names that carry the league site's suffixes. */
function lineup(...numbers: string[]): ClubLineup {
  const [one, two] = numbers.map((number) => ({ name: "PUCHEUX Theo (D)", number }));
  return { player1: one, player2: two };
}

/** A match between two sides, "a/b" sets from side A's point of view. */
function match(
  a: string[],
  b: string[],
  scores: string | undefined,
  overrides: Partial<RecordMatch> = {},
): RecordMatch {
  return {
    dateMatch: "17/01/2026",
    phase: "P 1",
    scores,
    clubALineup: lineup(...a),
    clubBLineup: lineup(...b),
    ...overrides,
  };
}

const WIN_A = "15/08 15/09";
const WIN_B = "07/15 04/15";

describe("lineupLicence", () => {
  it.each([
    ["066629", "066629"],
    [" 066629 ", "066629"],
    ["097866 - 01-641-015", "097866"],
  ])("reads %p as %p", (number, licence) => {
    expect(lineupLicence(number)).toBe(licence);
  });

  it.each([undefined, null, "", "   ", "- 01-641-015"])("finds no licence in %p", (number) => {
    expect(lineupLicence(number)).toBeNull();
  });
});

describe("buildTeamRecords", () => {
  it("counts wins and losses on either side of an individual match", () => {
    const records = buildTeamRecords([ranked("t1", "066629"), ranked("t2", "107759")], [
      match(["066629"], ["107759"], WIN_A),
      match(["107759"], ["066629"], WIN_A),
      match(["107759"], ["066629"], WIN_B),
    ]);
    expect(records.get("t1")).toEqual({ wins: 2, losses: 1, form: ["W", "L", "W"] });
    expect(records.get("t2")).toEqual({ wins: 1, losses: 2, form: ["L", "W", "L"] });
  });

  it("reads the licence before the second code Frontis adds to a lineup number", () => {
    const records = buildTeamRecords([ranked("t1", "097866")], [
      match(["097866 - 01-641-015"], ["066629"], WIN_A),
    ]);
    expect(records.get("t1")).toEqual({ wins: 1, losses: 0, form: ["W"] });
  });

  it("tells namesakes apart by licence, whatever the names say", () => {
    // Both lineups are named "PUCHEUX Theo (D)": only the licences differ.
    const records = buildTeamRecords([ranked("theo", "066629"), ranked("other", "112233")], [
      match(["066629"], ["112233"], WIN_A),
    ]);
    expect(records.get("theo")).toEqual({ wins: 1, losses: 0, form: ["W"] });
    expect(records.get("other")).toEqual({ wins: 0, losses: 1, form: ["L"] });
  });

  it("matches a pair whatever the order of its players", () => {
    const records = buildTeamRecords(
      [ranked("pair1", "059063", "058964"), ranked("pair2", "095100", "098574")],
      [
        match(["058964", "059063"], ["095100", "098574"], WIN_A),
        match(["098574", "095100"], ["059063", "058964"], WIN_A),
      ],
    );
    expect(records.get("pair1")).toEqual({ wins: 1, losses: 1, form: ["W", "L"] });
    expect(records.get("pair2")).toEqual({ wins: 1, losses: 1, form: ["L", "W"] });
  });

  it("matches a team that lists a third player by the two who played", () => {
    const records = buildTeamRecords(
      [ranked("trio", "035136", "099953", "100001"), ranked("pair", "095100", "098574")],
      [match(["099953", "035136"], ["095100", "098574"], WIN_B)],
    );
    expect(records.get("trio")).toEqual({ wins: 0, losses: 1, form: ["L"] });
    expect(records.get("pair")).toEqual({ wins: 1, losses: 0, form: ["W"] });
  });

  it("prefers the team with exactly the side's licences to a team that also holds them", () => {
    const records = buildTeamRecords(
      [ranked("pair", "011111", "022222"), ranked("trio", "011111", "022222", "033333")],
      [match(["011111", "022222"], ["044444"], WIN_A)],
    );
    expect(records.get("pair")?.wins).toBe(1);
    expect(records.get("trio")?.wins).toBe(0);
  });

  it("matches no team when the side's licences fit more than one", () => {
    // Only one licence of the pair is known, and two teams list that player.
    const records = buildTeamRecords(
      [ranked("t1", "011111", "022222"), ranked("t2", "011111", "033333")],
      [match(["011111"], ["044444"], WIN_A)],
    );
    expect(records.get("t1")).toEqual({ wins: 0, losses: 0, form: [] });
    expect(records.get("t2")).toEqual({ wins: 0, losses: 0, form: [] });
  });

  it("matches no team on a side without licences", () => {
    const records = buildTeamRecords([ranked("t1", "066629")], [
      match([], ["066629"], WIN_A),
      { ...match([], [], WIN_A), clubALineup: undefined, clubBLineup: undefined },
    ]);
    expect(records.get("t1")).toEqual({ wins: 0, losses: 1, form: ["L"] });
  });

  it.each([
    ["no score", undefined],
    ["an empty score", ""],
    ["a score that is not sets", "Forfait"],
    ["even sets", "15/08 08/15"],
  ])("leaves out a match with %s", (_label, scores) => {
    const records = buildTeamRecords([ranked("t1", "066629")], [
      match(["066629"], ["107759"], scores),
      match(["066629"], ["107759"], WIN_A),
    ]);
    expect(records.get("t1")).toEqual({ wins: 1, losses: 0, form: ["W"] });
  });

  it("gives a team without results 0-0 and no form", () => {
    const records = buildTeamRecords([ranked("t1", "066629"), ranked("t2", "107759")], [
      match(["066629"], ["999999"], WIN_A),
    ]);
    expect(records.get("t2")).toEqual({ wins: 0, losses: 0, form: [] });
    expect(buildTeamRecords([ranked("t1", "066629")], []).get("t1")).toEqual({
      wins: 0,
      losses: 0,
      form: [],
    });
  });

  it("keeps the last five results, oldest first, ordered by date", () => {
    const t1 = ["066629"];
    const other = ["107759"];
    const records = buildTeamRecords([ranked("t1", "066629")], [
      match(t1, other, WIN_A, { dateMatch: "04/02/2026", phase: "Q 1" }),
      match(t1, other, WIN_B, { dateMatch: "17/01/2026", phase: "P 2" }),
      match(t1, other, WIN_A, { dateMatch: "31/01/2026", phase: "P 9" }),
      match(t1, other, WIN_B, { dateMatch: "24/01/2026", phase: "P 5" }),
      match(t1, other, WIN_B, { dateMatch: "28/02/2026", phase: "D 1" }),
      match(t1, other, WIN_A, { dateMatch: "03/02/2026", phase: "P 20" }),
    ]);
    // 17/01 L, then 24/01 L, 31/01 W, 03/02 W, 04/02 W, 28/02 L: the first drops out.
    expect(records.get("t1")).toEqual({ wins: 3, losses: 3, form: ["L", "W", "W", "W", "L"] });
  });

  it("orders matches of the same day by round, then puts unreadable dates last", () => {
    const t1 = ["096222"];
    const other = ["066629"];
    const records = buildTeamRecords([ranked("t1", "096222")], [
      match(t1, other, WIN_B, { dateMatch: undefined, phase: "P 1" }),
      match(t1, other, WIN_B, { dateMatch: "28/02/2026", phase: "F 1" }),
      match(t1, other, WIN_A, { dateMatch: "28/02/2026", phase: "D 2" }),
      match(t1, other, WIN_A, { dateMatch: "a later date", phase: "P 2" }),
    ]);
    // D 2 is won before the final is lost on the same day; the undated matches come after.
    expect(records.get("t1")?.form).toEqual(["W", "L", "L", "W"]);
  });
});

// Rows below come from Frontis: lcapb competition 502, specialty 138, category 1573.
describe("ranking labels", () => {
  let tFr: TFunction;
  let tEn: TFunction;

  beforeAll(async () => {
    tFr = await translator("fr");
    tEn = await translator("en");
  });

  const champion: RankingRow = {
    id: "95",
    rank: 1,
    clubName: "CA BEGLAIS",
    teamNumber: 1,
    phase: "Champion",
    isChampion: true,
    isForfeit: false,
    players: [
      { licence: "059063", name: "NICOL Guillaume" },
      { licence: "058964", name: "GONZALEZ Antoine" },
    ],
  };
  const quarter: RankingRow = {
    id: "102",
    rank: 8,
    clubName: "CA BEGLAIS",
    teamNumber: 3,
    phase: "1/4 de finale",
    isChampion: false,
    isForfeit: false,
    players: [
      { licence: "063917", name: "GUITTON Cyril" },
      { licence: "096009", name: null },
    ],
  };

  it("names the champion in the app's language and keeps the league's other phases", () => {
    expect(phaseLabel(champion, tEn)).toBe("Champion");
    expect(phaseLabel(quarter, tEn)).toBe("1/4 de finale");
  });

  it("says the form in words, oldest first", () => {
    expect(formLabel(["W", "W", "L"], tFr)).toBe(
      "derniers résultats : victoire, victoire, défaite",
    );
    expect(formLabel(["L", "W"], tEn)).toBe("last results: loss, win");
  });

  it("has the form words in every language", async () => {
    for (const lng of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      const t = await translator(lng);
      const label = formLabel(["W", "L"], t);
      expect(label).not.toMatch(/ranking\./);
      expect(label).toContain(t("ranking.form_win_a11y"));
      expect(label).toContain(t("ranking.form_loss_a11y"));
    }
  });

  it("reads a row as one sentence: rank, players, club, team, phase, record and form", () => {
    const record = { wins: 7, losses: 0, form: ["W", "W", "W", "W", "W"] as FormResult[] };
    expect(rowLabel(champion, record, tFr)).toBe(
      "Rang 1, NICOL Guillaume, GONZALEZ Antoine, CA BEGLAIS, Équipe 1, Champion, "
        + "7 victoires, 0 défaite, derniers résultats : victoire, victoire, victoire, victoire, "
        + "victoire",
    );
  });

  it("names a player listed by licence alone", () => {
    expect(rowLabel(quarter, { wins: 1, losses: 1, form: ["W", "L"] }, tEn)).toBe(
      "Rank 8, GUITTON Cyril, Licence 096009, CA BEGLAIS, Team 3, 1/4 de finale, "
        + "1 win, 1 loss, last results: win, loss",
    );
  });

  it("says when a team has no scored match, and stops at the phase while results load", () => {
    expect(rowLabel(quarter, { wins: 0, losses: 0, form: [] }, tEn)).toBe(
      "Rank 8, GUITTON Cyril, Licence 096009, CA BEGLAIS, Team 3, 1/4 de finale, "
        + "no match played",
    );
    expect(rowLabel(quarter, undefined, tEn)).toBe(
      "Rank 8, GUITTON Cyril, Licence 096009, CA BEGLAIS, Team 3, 1/4 de finale",
    );
  });
});
