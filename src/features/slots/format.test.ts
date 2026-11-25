import { createInstance } from "i18next";

import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import {
  capitalize,
  dateNames,
  formatClock,
  formatDay,
  formatDeadline,
  formatLongDate,
  formatMonthYear,
  formatSchedule,
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

describe("formatSchedule", () => {
  const t = (key: string) => ({ "slot.interval.weekly": "Every week" })[key] ?? key;
  const names = {
    weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    weekdaysShort: [],
    months: [],
    monthsShort: [],
  };

  it("writes the weekday, the times and the frequency", () => {
    expect(
      formatSchedule(t, names, "en", { weekday: 3, time_from: "18:00", interval_weeks: 1 }),
    ).toBe("Wednesday · 18:00 · Every week");
    expect(
      formatSchedule(t, names, "en", {
        weekday: 1,
        time_from: "18:00",
        time_to: "19:30",
        interval_weeks: 2,
      }),
    ).toBe("Monday · 18:00–19:30 · slot.interval.fortnightly");
  });
});

describe("formatClock", () => {
  it("writes the screen time with two digits and the message time as the language does", () => {
    const fr = translate("fr");
    const en = translate("en");
    expect(formatClock(fr, { hour: 20, minute: 0 }, "screen")).toBe("20:00");
    expect(formatClock(fr, { hour: 9, minute: 5 }, "screen")).toBe("09:05");
    expect(formatClock(fr, { hour: 20, minute: 0 }, "message")).toBe("20h");
    expect(formatClock(fr, { hour: 20, minute: 30 }, "message")).toBe("20h30");
    expect(formatClock(en, { hour: 20, minute: 0 }, "message")).toBe("20:00");
  });
});

describe("formatDeadline", () => {
  // Thursday 26 November 2026; pik sends the deadline in UTC.
  const SESSION = { year: 2026, month: 11, day: 26 };

  it("names the weekday and the Paris time, as the issue's examples write them", () => {
    const t = translate("fr");
    const names = dateNames(t);
    // Tuesday 24 November at 20:00 in Paris, 19:00 UTC.
    expect(formatDeadline(t, names, "2026-11-24T19:00:00Z", SESSION, "screen")).toBe(
      "mardi 20:00",
    );
    // Wednesday 25 November at 20:00 in Paris.
    expect(formatDeadline(t, names, "2026-11-25T19:00:00Z", SESSION, "message")).toBe(
      "mercredi 20h",
    );
  });

  it("adds the date to a deadline more than six days before the session", () => {
    const t = translate("fr");
    expect(formatDeadline(t, dateNames(t), "2026-11-17T19:00:00Z", SESSION, "screen")).toBe(
      "mar. 17 nov. 20:00",
    );
  });

  it.each(
    [
      ["en", "Wednesday 20:00"],
      ["es", "miércoles 20:00"],
      ["eu", "asteazkena 20:00"],
    ] as const,
  )("writes it in %s", (lng, expected) => {
    const t = translate(lng);
    expect(formatDeadline(t, dateNames(t), "2026-11-25T19:00:00Z", SESSION, "message")).toBe(
      expected,
    );
  });

  it("is empty without an instant", () => {
    const t = translate("fr");
    expect(formatDeadline(t, dateNames(t), "", SESSION, "screen")).toBe("");
  });
});
