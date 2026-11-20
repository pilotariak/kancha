import { comparePlainDates, dateTone, formatMatchDate, parsePlainDate } from "./matchDate";

// Expected values were recorded from @js-temporal/polyfill 0.5.1 before it was removed.
describe("parsePlainDate", () => {
  it.each([
    ["18/11/2026", { year: 2026, month: 11, day: 18 }],
    ["1/2/2026", { year: 2026, month: 2, day: 1 }],
    ["29/02/2024", { year: 2024, month: 2, day: 29 }],
    ["1/1/2026/extra", { year: 2026, month: 1, day: 1 }],
    ["18/11/2026 ", { year: 2026, month: 11, day: 18 }],
  ])("reads %j", (input, expected) => {
    expect(parsePlainDate(input)).toEqual(expected);
  });

  it.each([
    ["31/02/2026", { year: 2026, month: 2, day: 28 }],
    ["29/02/2025", { year: 2025, month: 2, day: 28 }],
    ["31/04/2026", { year: 2026, month: 4, day: 30 }],
    ["32/01/2026", { year: 2026, month: 1, day: 31 }],
    ["15/13/2026", { year: 2026, month: 12, day: 15 }],
  ])("clamps an out-of-range day or month in %j", (input, expected) => {
    expect(parsePlainDate(input)).toEqual(expected);
  });

  it.each([
    ["1.9/2.5/2026.7", { year: 2026, month: 2, day: 1 }],
    ["0x10/1/2026", { year: 2026, month: 1, day: 16 }],
    ["1/1/ ", { year: 0, month: 1, day: 1 }],
    ["1/1/-5", { year: -5, month: 1, day: 1 }],
  ])("converts parts with Number() and truncates them: %j", (input, expected) => {
    expect(parsePlainDate(input)).toEqual(expected);
  });

  it.each([
    "",
    "18/11",
    "1//2026",
    "2026-11-18",
    "0/1/2026",
    "1/0/2026",
    "-1/1/2026",
    "0.5/1/2026",
    " /1/2026",
    "abc/1/2026",
    "Infinity/1/2026",
    "14/09/275760",
    "18/04/-271821",
  ])("rejects %j", (input) => {
    expect(parsePlainDate(input)).toBeNull();
  });

  it("accepts the bounds of the Temporal.PlainDate range", () => {
    expect(parsePlainDate("13/09/275760")).toEqual({ year: 275760, month: 9, day: 13 });
    expect(parsePlainDate("19/04/-271821")).toEqual({ year: -271821, month: 4, day: 19 });
  });
});

describe("comparePlainDates", () => {
  const date = { year: 2026, month: 11, day: 18 };

  it("orders by year, then month, then day", () => {
    expect(comparePlainDates(date, { year: 2027, month: 1, day: 1 })).toBeLessThan(0);
    expect(comparePlainDates(date, { year: 2026, month: 10, day: 31 })).toBeGreaterThan(0);
    expect(comparePlainDates(date, { year: 2026, month: 11, day: 19 })).toBeLessThan(0);
    expect(comparePlainDates(date, { ...date })).toBe(0);
  });
});

describe("dateTone", () => {
  // Months are 0-based in the Date constructor: this is 18 November 2026, 23:30 local time.
  const now = new Date(2026, 10, 18, 23, 30);

  it("is green today and gives no tone to a past or future match", () => {
    expect(dateTone("18/11/2026", now)).toBe("green");
    expect(dateTone("17/11/2026", now)).toBeNull();
    expect(dateTone("17/01/2026", now)).toBeNull();
    expect(dateTone("19/11/2026", now)).toBeNull();
  });

  it("uses the local calendar date of now", () => {
    expect(dateTone("18/11/2026", new Date(2026, 10, 18, 0, 0))).toBe("green");
    expect(dateTone("18/11/2026", new Date(2026, 10, 19, 0, 0))).toBeNull();
  });

  it("compares a clamped date, so 31/11 reads as 30/11", () => {
    expect(dateTone("31/11/2026", new Date(2026, 10, 30, 12, 0))).toBe("green");
  });

  it("gives no tone when the date is missing or unreadable", () => {
    expect(dateTone(undefined, now)).toBeNull();
    expect(dateTone("", now)).toBeNull();
    expect(dateTone("TBD", now)).toBeNull();
    expect(dateTone("0/11/2026", now)).toBeNull();
  });
});

describe("formatMatchDate", () => {
  // ICU versions differ in spaces and abbreviation dots, so compare with Intl itself.
  const short = (locale: string, date: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" })
      .format(date);

  it.each(["en", "fr", "es", "eu"])("formats the calendar day in %s", (locale) => {
    expect(formatMatchDate("17/01/2026", locale)).toBe(short(locale, new Date(2026, 0, 17)));
  });

  it("keeps the calendar day of the match", () => {
    const formatted = formatMatchDate("17/01/2026", "en");
    expect(formatted).toContain("17");
    expect(formatted).toContain("Sat");
    expect(formatMatchDate("01/03/2026", "en")).toContain("Sun");
  });

  it("formats the clamped date, so 31/02 reads as 28/02", () => {
    expect(formatMatchDate("31/02/2026", "en")).toBe(short("en", new Date(2026, 1, 28)));
  });

  it("returns an unreadable date as Frontis sent it", () => {
    expect(formatMatchDate("TBD", "fr")).toBe("TBD");
    expect(formatMatchDate(" 2026-01-17 ", "fr")).toBe("2026-01-17");
  });

  it("returns null when the date is missing", () => {
    expect(formatMatchDate(undefined, "fr")).toBeNull();
    expect(formatMatchDate("", "fr")).toBeNull();
    expect(formatMatchDate("  ", "fr")).toBeNull();
  });
});
