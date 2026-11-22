import { createInstance, type TFunction } from "i18next";

import type { PhaseType } from "@/components/BracketView";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import {
  activePage,
  CONNECTOR_WIDTH,
  KNOCKOUT_PEEK,
  knockoutColumnWidth,
  knockoutRowWidth,
  MIN_COLUMN_WIDTH,
  poolSummaryLabel,
  splitRounds,
  summarizePool,
} from "./bracket";

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

const round = (type: PhaseType) => ({ type });
const types = (rounds: { type: PhaseType }[]) => rounds.map((r) => r.type);

describe("splitRounds", () => {
  it("puts the knockout rounds first, in the order they are played, then the pools", () => {
    // lcapb 500, specialty 137, category 1573: pools, semi-finals, final.
    const { knockout, groups } = splitRounds([round("P"), round("D"), round("F")]);
    expect(types(knockout)).toEqual(["D", "F"]);
    expect(types(groups)).toEqual(["P"]);
  });

  it("orders the rounds whatever order they come in", () => {
    const { knockout, groups } = splitRounds([
      round("F"),
      round("other"),
      round("Q"),
      round("P"),
      round("D"),
      round("B1T"),
      round("H"),
    ]);
    expect(types(knockout)).toEqual(["B1T", "H", "Q", "D", "F"]);
    expect(types(groups)).toEqual(["P", "other"]);
  });

  it("counts every barrage as a knockout round", () => {
    const { knockout } = splitRounds([round("BM"), round("B"), round("B3T"), round("B2T")]);
    expect(types(knockout)).toEqual(["B", "BM", "B2T", "B3T"]);
  });

  it("leaves a competition with pools only without knockout rounds", () => {
    const { knockout, groups } = splitRounds([round("P"), round("other")]);
    expect(knockout).toEqual([]);
    expect(types(groups)).toEqual(["P", "other"]);
  });

  it("keeps the rounds it is given", () => {
    const rounds = [{ type: "F" as const, results: [1] }, { type: "P" as const, results: [2] }];
    const { knockout, groups } = splitRounds(rounds);
    expect(knockout[0]).toBe(rounds[0]);
    expect(groups[0]).toBe(rounds[1]);
  });
});

describe("knockoutColumnWidth", () => {
  it("leaves room for the edge of the next column on a 390px phone", () => {
    const width = knockoutColumnWidth(390, 2);
    expect(width).toBe(390 - 20 - CONNECTOR_WIDTH - KNOCKOUT_PEEK);
    // The final starts on screen, KNOCKOUT_PEEK from the right edge.
    expect(20 + width + CONNECTOR_WIDTH).toBe(390 - KNOCKOUT_PEEK);
  });

  it("gives a lone round the width between the gutters", () => {
    expect(knockoutColumnWidth(390, 1)).toBe(350);
  });

  it("stays one card wide at most, and readable on a narrow screen", () => {
    expect(knockoutColumnWidth(700, 3)).toBe(350);
    expect(knockoutColumnWidth(280, 3)).toBe(MIN_COLUMN_WIDTH);
  });

  it("is one card wide before the frame is measured", () => {
    expect(knockoutColumnWidth(0, 3)).toBe(350);
  });
});

describe("knockoutRowWidth", () => {
  it("adds the gutters and a chevron between two columns", () => {
    expect(knockoutRowWidth(298, 2)).toBe(20 + 298 + CONNECTOR_WIDTH + 298 + 20);
    expect(knockoutRowWidth(350, 1)).toBe(390);
  });
});

describe("activePage", () => {
  // Three rounds at 390px: 298px columns, 330px pages, 608px of scroll.
  const page = 298 + CONNECTOR_WIDTH;
  const max = knockoutRowWidth(298, 3) - 390;

  it("marks the column nearest the left edge", () => {
    expect(activePage(0, page, 3, max)).toBe(0);
    expect(activePage(page * 0.4, page, 3, max)).toBe(0);
    expect(activePage(page * 0.6, page, 3, max)).toBe(1);
    expect(activePage(page, page, 3, max)).toBe(1);
  });

  it("marks the last round at the end of the scroll", () => {
    expect(max).toBeLessThan(2 * page);
    expect(activePage(max, page, 3, max)).toBe(2);
    expect(activePage(max - 0.5, page, 3, max)).toBe(2);
  });

  it("stays in range when the scroll bounces", () => {
    expect(activePage(-40, page, 3, max)).toBe(0);
    expect(activePage(max + 40, page, 3, max)).toBe(2);
  });

  it("marks the only round", () => {
    expect(activePage(0, 350, 1, 0)).toBe(0);
  });
});

describe("summarizePool", () => {
  it("counts the matches and the days, from the first day to the last", () => {
    // The pools of lcapb 500/137/1573: 3 matches a day, on 5 Sundays.
    const dates = ["06/09/2026", "13/09/2026", "20/09/2026", "27/09/2026", "04/10/2026"];
    const results = dates.flatMap((dateMatch) => Array(3).fill({ dateMatch }));
    expect(summarizePool(results)).toEqual({
      matches: 15,
      days: 5,
      first: { year: 2026, month: 9, day: 6 },
      last: { year: 2026, month: 10, day: 4 },
    });
  });

  it("orders the days by date, not by the order of the matches", () => {
    const summary = summarizePool([
      { dateMatch: "04/10/2026" },
      { dateMatch: "06/09/2026" },
      { dateMatch: "13/09/2026" },
    ]);
    expect(summary.first).toEqual({ year: 2026, month: 9, day: 6 });
    expect(summary.last).toEqual({ year: 2026, month: 10, day: 4 });
  });

  it("counts a match without a readable date, but no day for it", () => {
    expect(
      summarizePool([{ dateMatch: "06/09/2026" }, { dateMatch: undefined }, {
        dateMatch: "à fixer",
      }]),
    ).toEqual({
      matches: 3,
      days: 1,
      first: { year: 2026, month: 9, day: 6 },
      last: { year: 2026, month: 9, day: 6 },
    });
    expect(summarizePool([{ dateMatch: undefined }])).toEqual({
      matches: 1,
      days: 0,
      first: null,
      last: null,
    });
  });
});

describe("poolSummaryLabel", () => {
  const range = {
    matches: 15,
    days: 5,
    first: { year: 2026, month: 9, day: 6 },
    last: { year: 2026, month: 10, day: 4 },
  };
  const oneDay = { ...range, matches: 3, days: 1, last: range.first };
  const noDate = { matches: 2, days: 0, first: null, last: null };

  it("reads as the issue words it in French", async () => {
    const t = await translator("fr");
    expect(poolSummaryLabel(range, t, "fr")).toBe(
      "15 parties en 5 journées, du 6 septembre au 4 octobre",
    );
    expect(poolSummaryLabel(oneDay, t, "fr")).toBe("3 parties le 6 septembre");
    expect(poolSummaryLabel(noDate, t, "fr")).toBe("2 parties");
  });

  it("reads in English", async () => {
    const t = await translator("en");
    expect(poolSummaryLabel(range, t, "en")).toBe(
      "15 matches over 5 match days, from September 6 to October 4",
    );
    expect(poolSummaryLabel({ ...range, days: 1, matches: 1, last: range.first }, t, "en")).toBe(
      "1 match on September 6",
    );
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "has every string in %s",
    async (lng) => {
      const t = await translator(lng);
      for (const summary of [range, oneDay, noDate]) {
        const label = poolSummaryLabel(summary, t, lng);
        expect(label).not.toMatch(/bracket\.|details\.|\{\{/);
        expect(label).toContain(String(summary.matches));
      }
      expect(poolSummaryLabel(range, t, lng)).toContain("5");
    },
  );
});
