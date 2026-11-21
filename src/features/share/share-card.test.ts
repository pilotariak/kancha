import { createInstance, type TFunction } from "i18next";

import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";
import type { Result } from "@/types/competition";

import {
  canShareResult,
  displayLink,
  formatCardDate,
  resultCardData,
  resultLink,
  scoreCardData,
  teamNames,
} from "./share-card";

const LOCALES = { en, fr } as const;

async function translator(lng: keyof typeof LOCALES): Promise<TFunction> {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { [lng]: { translation: LOCALES[lng] } },
    interpolation: { escapeValue: false },
  });
  return i18n.getFixedT(lng);
}

// The final of lcapb competition 502, specialty 136, category 1573, as Frontis returns it.
const FINAL: Result = {
  id: "9786",
  phase: "F 1",
  dateMatch: "28/02/2026",
  scores: "15/01 15/05",
  clubA: { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" },
  clubB: { id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" },
  clubALineup: { player1: { name: "PUCHEUX Theo" } },
  clubBLineup: { player1: { name: "DUFFOUR-NONNON Lucas (D)" } },
  competition: { id: "502", name: "Championnat CCAPB 2025-2026" },
  specialty: { id: "136", name: "Mur à Gauche / P.G. Creuse Masculin Individuel" },
  category: { id: "1573", name: "1ère Série" },
};

describe("canShareResult", () => {
  it("shares a match with a score", () => {
    expect(canShareResult(FINAL)).toBe(true);
  });

  it("does not share a match without a score, or with one it cannot read", () => {
    expect(canShareResult({ ...FINAL, scores: undefined })).toBe(false);
    expect(canShareResult({ ...FINAL, scores: "" })).toBe(false);
    expect(canShareResult({ ...FINAL, scores: "15/01 F" })).toBe(false);
  });
});

describe("teamNames", () => {
  it("names the players, both of a pair", () => {
    const pair: Result = {
      ...FINAL,
      clubALineup: { player1: { name: "A" }, player2: { name: "B" } },
    };
    expect(teamNames(pair)).toEqual(["A / B", "DUFFOUR-NONNON Lucas (D)"]);
  });

  it("names the club without a lineup", () => {
    expect(teamNames({ ...FINAL, clubALineup: undefined, clubBLineup: {} })).toEqual([
      "AMIS DE LA PEL.BASQUE-LE HAILLAN",
      "AMIS DE LA PEL.BASQUE-LE HAILLAN",
    ]);
  });
});

describe("resultLink", () => {
  it("links the results screen on the match's specialty and category", () => {
    expect(resultLink(FINAL)).toBe(
      "https://kancha.pilotariak.com/competitions/details?id=502&specialtyId=136&categoryId=1573",
    );
  });

  it("leaves out a missing category", () => {
    expect(resultLink({ ...FINAL, category: undefined })).toBe(
      "https://kancha.pilotariak.com/competitions/details?id=502&specialtyId=136",
    );
  });
});

describe("displayLink", () => {
  it("drops the scheme and lets the query break between parameters", () => {
    expect(displayLink("https://kancha.pilotariak.com/competitions/details?id=502&categoryId=1"))
      .toBe("kancha.pilotariak.com/competitions/details?​id=502&​categoryId=1");
  });
});

describe("formatCardDate", () => {
  it("writes the date in full, with the year and a capital", () => {
    const date = { year: 2026, month: 2, day: 28 };
    expect(formatCardDate(date, "fr")).toBe("Samedi 28 février 2026");
    expect(formatCardDate(date, "en")).toBe("Saturday, February 28, 2026");
  });
});

describe("resultCardData", () => {
  it("builds the card of the final", async () => {
    const t = await translator("en");
    expect(resultCardData(FINAL, t, "en")).toEqual({
      eyebrow: "Championnat CCAPB 2025-2026",
      title: "Mur à Gauche / P.G. Creuse Masculin Individuel",
      subtitle: "1ère Série",
      round: { label: "Final 1", final: true },
      date: "Saturday, February 28, 2026",
      teams: [
        {
          name: "PUCHEUX Theo",
          club: "AMIS DE LA PEL.BASQUE-LE HAILLAN",
          points: [15, 15],
          winner: true,
        },
        {
          name: "DUFFOUR-NONNON Lucas (D)",
          club: "AMIS DE LA PEL.BASQUE-LE HAILLAN",
          points: [1, 5],
          winner: false,
        },
      ],
      linkLabel: "Results on Kancha",
      link:
        "https://kancha.pilotariak.com/competitions/details?id=502&specialtyId=136&categoryId=1573",
      fileName: "kancha-result-9786",
    });
  });

  it("translates the round, the date and the link label", async () => {
    const card = resultCardData(FINAL, await translator("fr"), "fr");
    expect(card?.round).toEqual({ label: "Finale 1", final: true });
    expect(card?.date).toBe("Samedi 28 février 2026");
    expect(card?.linkLabel).toBe("Résultats sur Kancha");
  });

  it("marks no winner when the sets are even", async () => {
    const card = resultCardData({ ...FINAL, scores: "15/10 10/15" }, await translator("en"), "en");
    expect(card?.teams.map((team) => team.winner)).toEqual([false, false]);
  });

  it("keeps the club as the name, once, without a lineup", async () => {
    const card = resultCardData({ ...FINAL, clubALineup: undefined }, await translator("en"), "en");
    expect(card?.teams[0]).toMatchObject({ name: "AMIS DE LA PEL.BASQUE-LE HAILLAN", club: null });
  });

  it("leaves out a missing round and an unreadable date", async () => {
    const t = await translator("en");
    const card = resultCardData({ ...FINAL, phase: undefined, dateMatch: "à venir" }, t, "en");
    expect(card?.round).toBeNull();
    expect(card?.date).toBeNull();
  });

  it("gives no card for a match without a score", async () => {
    expect(resultCardData({ ...FINAL, scores: undefined }, await translator("en"), "en"))
      .toBeNull();
  });
});

describe("scoreCardData", () => {
  const match = { teamA: "Bleus", teamB: "Rouges", scoreA: 40, scoreB: 32, target: 40 };

  it("builds the card of a match kept in match mode", async () => {
    const t = await translator("fr");
    const now = new Date(2026, 10, 21, 18, 30);
    expect(scoreCardData({ ...match, winner: "a" }, t, "fr", now)).toEqual({
      eyebrow: "Partie",
      title: "En 40 points",
      subtitle: null,
      round: null,
      date: "Samedi 21 novembre 2026",
      teams: [
        { name: "Bleus", club: null, points: [40], winner: true },
        { name: "Rouges", club: null, points: [32], winner: false },
      ],
      linkLabel: "Comptez les points avec Kancha",
      link: "https://kancha.pilotariak.com/score",
      fileName: "kancha-match",
    });
  });

  it("marks the second team when it wins", async () => {
    const card = scoreCardData(
      { ...match, scoreA: 12, scoreB: 40, winner: "b" },
      await translator("en"),
      "en",
    );
    expect(card.title).toBe("First to 40 points");
    expect(card.teams.map((team) => team.winner)).toEqual([false, true]);
  });
});
