import { createInstance } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import {
  capitalize,
  dateNames,
  formatDay,
  formatLongDate,
  formatMonthYear,
  type Translate,
} from "./format";

const LOCALES = { en, fr, es, eu } as const;

function translate(lng: keyof typeof LOCALES): Translate {
  const instance = createInstance();
  void instance.init({
    lng,
    resources: { [lng]: { translation: LOCALES[lng] } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance.t.bind(instance) as Translate;
}

// Wednesday 25 November 2026.
const DATE = { year: 2026, month: 11, day: 25 };

describe("slot dates in each language", () => {
  it.each(
    [
      ["en", "Wed 25 Nov", "Wednesday 25 November 2026", "November 2026"],
      ["fr", "mer. 25 nov.", "mercredi 25 novembre 2026", "novembre 2026"],
      ["es", "mié, 25 nov", "miércoles, 25 de noviembre de 2026", "noviembre de 2026"],
      ["eu", "aza. 25, az.", "2026(e)ko azaroaren 25(a), asteazkena", "2026(e)ko azaroa"],
    ] as const,
  )("writes %s dates from its own names", (lng, day, long, monthYear) => {
    const t = translate(lng);
    const names = dateNames(t);
    expect(formatDay(t, names, DATE)).toBe(day);
    expect(formatLongDate(t, names, DATE)).toBe(long);
    expect(formatMonthYear(t, names, 2026, 11)).toBe(monthYear);
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "has seven weekdays and twelve months in %s",
    (lng) => {
      const names = dateNames(translate(lng));
      expect(names.weekdays).toHaveLength(7);
      expect(names.weekdaysShort).toHaveLength(7);
      expect(names.months).toHaveLength(12);
      expect(names.monthsShort).toHaveLength(12);
    },
  );

  it("names Sunday last", () => {
    const t = translate("fr");
    expect(formatDay(t, dateNames(t), { year: 2026, month: 11, day: 29 })).toBe("dim. 29 nov.");
  });
});

describe("capitalize", () => {
  it("raises the first letter only", () => {
    expect(capitalize("mercredi 25 novembre", "fr")).toBe("Mercredi 25 novembre");
    expect(capitalize("", "fr")).toBe("");
  });
});
