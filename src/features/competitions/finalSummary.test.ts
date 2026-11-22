import { createInstance, type TFunction } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";
import type { Club, ClubLineup, Result } from "@/types/competition";

import {
  factsText,
  finalDateText,
  finalLabel,
  finalSummary,
  scoreText,
  teamLabel,
  thirdPlaceLabel,
} from "./finalSummary";

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

interface Side {
  club: Club;
  lineup?: ClubLineup;
}

const BAZAS = { id: "4066", name: "US BAZAS PELOTE BASQUE" };
const BOIENNE = { id: "4067", name: "CANCHA BOIENNE" };
const VILLENAVE = { id: "4068", name: "PILOTARI CLUB VILLENAVAIS" };
const CHANTECLER = { id: "4075", name: "PELOTARI CHANTECLER BX LAC" };

function pair(club: Club, p1: [string, string], p2: [string, string]): Side {
  return {
    club,
    lineup: {
      player1: { name: p1[0], number: p1[1] },
      player2: { name: p2[0], number: p2[1] },
    },
  };
}

// Championnat CCAPB 2026-2027, Mur à Gauche P.G. Pleine Feminine, 1ère Série (lcapb 500/137/1573),
// as Frontis served it on 2026-11-22. Two US BAZAS and two CANCHA BOIENNE teams play in it.
const LABROUCHE = pair(BAZAS, ["LABROUCHE Jessica", "092213"], ["CHAUMEIL Clemence", "105288"]);
const DUCOS = pair(BAZAS, ["DUCOS Karine", "086202"], ["TIGHILT Aurelie", "085522"]);
const BARBEZAT = pair(BOIENNE, ["BARBEZAT Natalia", "103159"], ["FLOUS Elodie", "106662"]);
const MOREL = pair(BOIENNE, ["MOREL Perrine", "105634"], ["MARTIN Alizee", "109326"]);
const BOUDY = pair(
  CHANTECLER,
  ["BOUDY Anais", "095978"],
  ["COLAQUY Jennifer (E)", "072019 - 01-330-055"],
);
const MARTIN = pair(VILLENAVE, ["MARTIN Morgane", "107992"], ["CAUTURE Lory", "082794"]);

let nextId = 10487;

function match(phase: string, date: string, scores: string | undefined, a: Side, b: Side): Result {
  return {
    id: String(nextId++),
    competition: { id: "500", name: "Championnat CCAPB 2026-2027" },
    specialty: { id: "137", name: "Mur à Gauche / P.G. Pleine Feminine" },
    category: { id: "1573", name: "1ère Série" },
    dateMatch: date,
    phase,
    scores,
    clubA: a.club,
    clubB: b.club,
    clubALineup: a.lineup,
    clubBLineup: b.lineup,
  };
}

const RESULTS: Result[] = [
  match("P 1", "06/09/2026", "35/25", BARBEZAT, DUCOS),
  match("P 2", "06/09/2026", "20/35", MOREL, LABROUCHE),
  match("P 3", "06/09/2026", "35/10", BOUDY, MARTIN),
  match("P 4", "13/09/2026", "35/25", LABROUCHE, BARBEZAT),
  match("P 5", "13/09/2026", "35/21", MARTIN, MOREL),
  match("P 6", "13/09/2026", "35/12", BOUDY, DUCOS),
  match("P 7", "20/09/2026", "35/21", BARBEZAT, MARTIN),
  match("P 8", "20/09/2026", "19/35", MOREL, BOUDY),
  match("P 9", "20/09/2026", "19/35", DUCOS, LABROUCHE),
  match("P 10", "27/09/2026", "35/29", BOUDY, BARBEZAT),
  match("P 11", "27/09/2026", "19/35", MARTIN, LABROUCHE),
  match("P 12", "27/09/2026", "35/10", MOREL, DUCOS),
  match("P 13", "04/10/2026", "26/35", BARBEZAT, MOREL),
  match("P 14", "04/10/2026", "30/35", LABROUCHE, BOUDY),
  match("P 15", "04/10/2026", "20/35", DUCOS, MARTIN),
  match("D 1", "25/10/2026", "35/21", BOUDY, MOREL),
  match("D 2", "25/10/2026", "35/20", LABROUCHE, BARBEZAT),
  match("F 1", "31/10/2026", "20/35", BOUDY, LABROUCHE),
];

/** The results with `phase` replaced by `patch`. */
function patched(results: Result[], phase: string, patch: Partial<Result>): Result[] {
  return results.map((r) => (r.phase === phase ? { ...r, ...patch } : r));
}

describe("finalSummary", () => {
  it("sums up 500/137/1573 with the values of issue #129", () => {
    const summary = finalSummary(RESULTS);

    expect(summary).toEqual({
      winners: {
        players: [
          { name: "LABROUCHE Jessica", licence: "092213" },
          { name: "CHAUMEIL Clemence", licence: "105288" },
        ],
        name: "LABROUCHE Jessica / CHAUMEIL Clemence",
        club: "US BAZAS PELOTE BASQUE",
      },
      runnerUp: {
        players: [
          { name: "BOUDY Anais", licence: "095978" },
          // The second code after the licence is dropped, the name kept as Frontis sends it.
          { name: "COLAQUY Jennifer (E)", licence: "072019" },
        ],
        name: "BOUDY Anais / COLAQUY Jennifer (E)",
        club: "PELOTARI CHANTECLER BX LAC",
      },
      // Club A lost the final 20/35: the winners' points come first.
      sets: [{ winners: 35, runnerUp: 20 }],
      date: { year: 2026, month: 10, day: 31 },
      thirdPlace: [
        {
          players: [
            { name: "MOREL Perrine", licence: "105634" },
            { name: "MARTIN Alizee", licence: "109326" },
          ],
          name: "MOREL Perrine / MARTIN Alizee",
          club: "CANCHA BOIENNE",
        },
        {
          players: [
            { name: "BARBEZAT Natalia", licence: "103159" },
            { name: "FLOUS Elodie", licence: "106662" },
          ],
          name: "BARBEZAT Natalia / FLOUS Elodie",
          club: "CANCHA BOIENNE",
        },
      ],
      // Six teams from four clubs: P 9 and P 13 are played between two teams of one club.
      teams: 6,
      matches: 18,
      days: 7,
      first: { year: 2026, month: 9, day: 6 },
      last: { year: 2026, month: 10, day: 31 },
    });
  });

  it("is null while one match has no score", () => {
    expect(finalSummary(patched(RESULTS, "P 7", { scores: undefined }))).toBeNull();
    expect(finalSummary(patched(RESULTS, "D 2", { scores: "" }))).toBeNull();
  });

  it("is null for pools only, every match played", () => {
    expect(finalSummary(RESULTS.filter((r) => r.phase?.startsWith("P ")))).toBeNull();
  });

  it("is null for an empty list", () => {
    expect(finalSummary([])).toBeNull();
  });

  it("is null when the final's sets are even", () => {
    expect(finalSummary(patched(RESULTS, "F 1", { scores: "15/10 10/15" }))).toBeNull();
  });

  it("is null when two matches read as the final", () => {
    const second = match("F 2", "07/11/2026", "35/30", BOUDY, LABROUCHE);
    expect(finalSummary([...RESULTS, second])).toBeNull();
  });

  it("names club A when it wins the final", () => {
    const summary = finalSummary(patched(RESULTS, "F 1", { scores: "35/30" }));
    expect(summary?.winners.club).toBe("PELOTARI CHANTECLER BX LAC");
    expect(summary?.runnerUp.club).toBe("US BAZAS PELOTE BASQUE");
    expect(summary?.sets).toEqual([{ winners: 35, runnerUp: 30 }]);
  });

  it("turns every set of a final in sets to the winners' side", () => {
    // lcapb 502/143/1574: club B won 2 sets to 1.
    const summary = finalSummary(patched(RESULTS, "F 1", { scores: "11/15 15/12 09/10" }));
    expect(summary?.winners.club).toBe("US BAZAS PELOTE BASQUE");
    expect(summary?.sets).toEqual([
      { winners: 15, runnerUp: 11 },
      { winners: 12, runnerUp: 15 },
      { winners: 10, runnerUp: 9 },
    ]);
    expect(scoreText(summary!.sets)).toBe("15–11  12–15  10–9");
  });

  it("has no third place without semi-finals", () => {
    // lidfpb 1/1/1 goes from the pools to the final.
    const summary = finalSummary(RESULTS.filter((r) => !r.phase?.startsWith("D ")));
    expect(summary?.thirdPlace).toEqual([]);
    expect(summary?.matches).toBe(16);
  });

  it("leaves out the loser of a tied semi-final", () => {
    const summary = finalSummary(patched(RESULTS, "D 1", { scores: "15/10 10/15" }));
    expect(summary?.thirdPlace.map((team) => team.name)).toEqual([
      "BARBEZAT Natalia / FLOUS Elodie",
    ]);
  });

  it("names a team without lineup by its club, with no players to link", () => {
    const summary = finalSummary(patched(RESULTS, "F 1", { clubBLineup: undefined }));
    expect(summary?.winners).toEqual({
      players: [],
      name: "US BAZAS PELOTE BASQUE",
      club: BAZAS.name,
    });
  });

  it("keeps a player whose lineup has no licence, without one", () => {
    const summary = finalSummary(
      patched(RESULTS, "F 1", {
        clubBLineup: { player1: { name: "LABROUCHE Jessica" }, player2: LABROUCHE.lineup?.player2 },
      }),
    );
    expect(summary?.winners.players).toEqual([
      { name: "LABROUCHE Jessica", licence: null },
      { name: "CHAUMEIL Clemence", licence: "105288" },
    ]);
  });

  it("counts a side without lineup by its club", () => {
    const noLineup = { club: BAZAS };
    const results = [
      match("P 1", "06/09/2026", "35/25", noLineup, BARBEZAT),
      match("F 1", "13/09/2026", "35/30", noLineup, BOUDY),
    ];
    expect(finalSummary(results)?.teams).toBe(3);
  });
});

describe("final summary labels", () => {
  const summary = finalSummary(RESULTS)!;

  it("prints the score, the date and the facts in English", async () => {
    const t = await translator("en");
    expect(scoreText(summary.sets)).toBe("35–20");
    expect(finalDateText(summary, "en")).toBe("Saturday, October 31, 2026");
    expect(factsText(summary, t, "en")).toBe(
      "6 teams, 18 matches over 7 match days, from September 6 to October 31",
    );
  });

  it("prints the date and the facts in French", async () => {
    const t = await translator("fr");
    expect(finalDateText(summary, "fr")).toBe("Samedi 31 octobre 2026");
    expect(factsText(summary, t, "fr")).toBe(
      "6 équipes, 18 parties en 7 journées, du 6 septembre au 31 octobre",
    );
  });

  it("says the final and third place in sentences", async () => {
    const t = await translator("fr");
    expect(teamLabel(summary.winners, t)).toBe(
      "LABROUCHE Jessica et CHAUMEIL Clemence, US BAZAS PELOTE BASQUE",
    );
    expect(finalLabel(summary, t, "fr")).toBe(
      "Finale, Samedi 31 octobre 2026 : gagnée 35 à 20 contre BOUDY Anais et COLAQUY Jennifer (E), "
        + "PELOTARI CHANTECLER BX LAC",
    );
    expect(thirdPlaceLabel(summary, t)).toBe(
      "Troisième place : MOREL Perrine et MARTIN Alizee, CANCHA BOIENNE; BARBEZAT Natalia et "
        + "FLOUS Elodie, CANCHA BOIENNE",
    );
  });

  it("says every set of the final", async () => {
    const t = await translator("en");
    const sets = finalSummary(patched(RESULTS, "F 1", { scores: "11/15 15/12 09/10" }))!;
    expect(finalLabel(sets, t, "en")).toContain("won 15 to 11, 12 to 15, 10 to 9 against");
  });

  it("says the final without its date when Frontis sends none", async () => {
    const t = await translator("en");
    expect(finalLabel({ ...summary, date: null }, t, "en")).toBe(
      "Final: won 35 to 20 against BOUDY Anais and COLAQUY Jennifer (E), PELOTARI CHANTECLER BX LAC",
    );
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "has every string in %s",
    async (lng) => {
      const t = await translator(lng);
      const labels = [
        factsText(summary, t, lng),
        finalLabel(summary, t, lng),
        thirdPlaceLabel(summary, t),
        teamLabel(summary.winners, t),
        t("final_summary.title"),
        t("final_summary.against", { team: summary.runnerUp.name }),
        t("final_summary.third_place"),
      ];
      for (const label of labels) {
        expect(label).not.toMatch(/final_summary|ranking\.|bracket\.|details\.|\{\{/);
      }
    },
  );
});
