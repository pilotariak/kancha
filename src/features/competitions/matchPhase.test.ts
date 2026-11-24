import { createInstance, type TFunction } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { matchPhaseLabel, parsePhase } from "./matchPhase";

const LOCALES = { en, es, eu, fr } as const;

// Every round the parser knows but the pools; "other" shows the phase as Frontis sent it.
const ROUND_TYPES = ["B", "BM", "B1T", "B2T", "B3T", "S", "H", "Q", "D", "F"] as const;

async function translator(lng: keyof typeof LOCALES): Promise<TFunction> {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { [lng]: { translation: LOCALES[lng] } },
    interpolation: { escapeValue: false },
  });
  return i18n.getFixedT(lng);
}

// Phases below come from Frontis: lcapb competition 502. "Poule A" stands in for a phase the
// parser does not know.
describe("parsePhase", () => {
  it("reads the round and the number", () => {
    expect(parsePhase("P 12")).toEqual({ type: "P", number: 12 });
    expect(parsePhase("B1T 2")).toEqual({ type: "B1T", number: 2 });
    expect(parsePhase("Q 4")).toEqual({ type: "Q", number: 4 });
  });

  it("returns other for a phase it does not know", () => {
    expect(parsePhase(undefined)).toEqual({ type: "other", number: 0 });
    expect(parsePhase("Poule A")).toEqual({ type: "other", number: 0 });
  });
});

describe("matchPhaseLabel", () => {
  let tFr: TFunction;
  let tEn: TFunction;

  beforeAll(async () => {
    tFr = await translator("fr");
    tEn = await translator("en");
  });

  it("names a pool match by its round, without the number", () => {
    // "P 10" is the tenth match of the pool round, not pool 10.
    expect(matchPhaseLabel("P 10", tFr)).toBe("Phase de poules");
    expect(matchPhaseLabel("P 10", tEn)).toBe("Pool stage");
  });

  it("names a knockout match in the singular", () => {
    expect(matchPhaseLabel("Q 2", tFr)).toBe("Quart de finale 2");
    expect(matchPhaseLabel("Q 2", tEn)).toBe("Quarterfinal 2");
    expect(matchPhaseLabel("D 1", tFr)).toBe("Demi-finale 1");
    expect(matchPhaseLabel("H 3", tFr)).toBe("Huitième de finale 3");
  });

  it("keeps a round name that is already singular", () => {
    expect(matchPhaseLabel("F 1", tFr)).toBe("Finale 1");
    expect(matchPhaseLabel("F 1", tEn)).toBe("Final 1");
  });

  it("shows a phase it does not know as Frontis sent it", () => {
    expect(matchPhaseLabel("Poule A", tFr)).toBe("Poule A");
    expect(matchPhaseLabel(undefined, tFr)).toBe("");
  });

  it("leaves the round divider in the plural", () => {
    expect(tFr("rounds.P")).toBe("Poules");
    expect(tEn("rounds.P")).toBe("Pools");
  });
});

describe.each(Object.entries(LOCALES))("%s locale", (_, messages) => {
  it.each(ROUND_TYPES)("gives round %s a match label that carries the number", (type) => {
    expect(messages.rounds_match[type]).toContain("{{number}}");
  });

  it("gives a pool match a label without the match number, and a pool its number", () => {
    expect(messages.rounds_match.P).not.toContain("{{number}}");
    expect(messages.details.pool).toContain("{{number}}");
  });
});
