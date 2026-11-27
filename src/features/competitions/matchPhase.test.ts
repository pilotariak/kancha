import { createInstance, type TFunction } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { matchPhaseLabel, parsePhase, ROUND_ORDER } from "./matchPhase";

const LOCALES = { en, es, eu, fr } as const;

// Every round the parser knows but the pools; "other" shows the phase as Frontis sent it.
const ROUND_TYPES = ["B", "BM", "B1T", "B2T", "B3T", "S", "H", "Q", "D", "F"] as const;

// The FFPB phases of competition 17, CHAMPIONNAT DE FRANCE 2026 (Frontis, X-Pilotariak-League:
// ffpb, 2026-11-27), in round order, and "BARRAGES MAINTIEN" from the frontis scraper's fixture.
// None carries a match number.
const FFPB_PHASES = [
  ["Poule 1", "P"],
  ["Poule 3", "P"],
  ["BARRAGE", "B"],
  ["BARRAGES MAINTIEN", "BM"],
  ["1/16EME DE FINALE", "S"],
  ["1/8EME DE FINALE", "H"],
  ["1/4 DE FINALE", "Q"],
  ["1/2 FINALE", "D"],
  ["FINALE", "F"],
] as const;

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

  it("reads every regional round code", () => {
    // ctpb's barrages, and the rounds lcapb, ctpb, llpb and lidfpb share.
    expect(parsePhase("B 2")).toEqual({ type: "B", number: 2 });
    expect(parsePhase("BM 1")).toEqual({ type: "BM", number: 1 });
    expect(parsePhase("B2T 3")).toEqual({ type: "B2T", number: 3 });
    expect(parsePhase("B3T 1")).toEqual({ type: "B3T", number: 1 });
    expect(parsePhase("S 16")).toEqual({ type: "S", number: 16 });
    expect(parsePhase("H 8")).toEqual({ type: "H", number: 8 });
    expect(parsePhase("D 1")).toEqual({ type: "D", number: 1 });
    expect(parsePhase("F 1")).toEqual({ type: "F", number: 1 });
  });

  it("returns other for a phase it does not know", () => {
    expect(parsePhase(undefined)).toEqual({ type: "other", number: 0 });
    expect(parsePhase("Poule A")).toEqual({ type: "other", number: 0 });
    // "T 1", a phase of ctpb and llpb, is no round the parser knows.
    expect(parsePhase("T 1")).toEqual({ type: "other", number: 0 });
  });

  it.each(FFPB_PHASES)("reads the FFPB phase %s as round %s, without a match number", (
    phase,
    type,
  ) => {
    expect(parsePhase(phase)).toEqual({ type, number: 0 });
  });

  it("reads a pool match of FFPB as the pool round, not as the pool's number", () => {
    // The pool comes from Result.pool: "Poule 12" is no twelfth match.
    expect(parsePhase("Poule 12")).toEqual({ type: "P", number: 0 });
  });

  it("reads an FFPB phase whole, whatever its case and spaces", () => {
    expect(parsePhase("Finale")).toEqual({ type: "F", number: 0 });
    expect(parsePhase(" 1/4  DE FINALE ")).toEqual({ type: "Q", number: 0 });
  });

  it("orders the FFPB rounds from the pools to the final", () => {
    const order = (phase: string) => ROUND_ORDER[parsePhase(phase).type];
    const phases = FFPB_PHASES.map(([phase]) => phase);
    expect([...phases].reverse().sort((a, b) => order(a) - order(b))).toEqual(
      // Pool matches tie, and keep the order they came in.
      ["Poule 3", "Poule 1", ...phases.slice(2)],
    );
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

  it("names an FFPB match by its round, without a number", () => {
    expect(matchPhaseLabel("1/4 DE FINALE", tFr)).toBe("Quart de finale");
    expect(matchPhaseLabel("1/4 DE FINALE", tEn)).toBe("Quarterfinal");
    expect(matchPhaseLabel("1/16EME DE FINALE", tFr)).toBe("Seizième de finale");
    expect(matchPhaseLabel("1/8EME DE FINALE", tFr)).toBe("Huitième de finale");
    expect(matchPhaseLabel("1/2 FINALE", tFr)).toBe("Demi-finale");
    expect(matchPhaseLabel("FINALE", tFr)).toBe("Finale");
    expect(matchPhaseLabel("FINALE", tEn)).toBe("Final");
    expect(matchPhaseLabel("BARRAGE", tFr)).toBe("Barrage");
    expect(matchPhaseLabel("BARRAGES MAINTIEN", tFr)).toBe("Barrage maintien");
  });

  it("names an FFPB pool match like any pool match, without the pool", () => {
    // The pool card's title names the pool, from Result.pool.
    expect(matchPhaseLabel("Poule 2", tFr)).toBe("Phase de poules");
    expect(matchPhaseLabel("Poule 2", tEn)).toBe("Pool stage");
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "names every FFPB round in %s without a placeholder",
    async (lng) => {
      const t = await translator(lng);
      for (const [phase] of FFPB_PHASES) {
        const label = matchPhaseLabel(phase, t);
        expect(label).not.toBe(phase);
        expect(label).not.toMatch(/\{\{|rounds_match/);
      }
    },
  );

  it("leaves the round divider in the plural", () => {
    expect(tFr("rounds.P")).toBe("Poules");
    expect(tEn("rounds.P")).toBe("Pools");
  });
});

describe.each(Object.entries(LOCALES))("%s locale", (_, messages) => {
  it.each(ROUND_TYPES)("gives round %s a match label that carries the number", (type) => {
    expect(messages.rounds_match[type]).toContain("{{number}}");
  });

  it.each(ROUND_TYPES)("gives round %s a match label without a number, for FFPB", (type) => {
    const label = messages.rounds_match_unnumbered[type];
    expect(label).toBeTruthy();
    expect(label).not.toContain("{{");
  });

  it("gives a pool match a label without the match number, and a pool its number", () => {
    expect(messages.rounds_match.P).not.toContain("{{number}}");
    expect(messages.details.pool).toContain("{{number}}");
  });
});
