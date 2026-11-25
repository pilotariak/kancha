import {
  addDays,
  type DateNames,
  daysBetween,
  defaultSeason,
  isoWeekday,
  localToday,
  monthName,
  parisTime,
  parseDateInput,
  parseIsoDate,
  toDateInput,
  toIsoDate,
  weekdayDates,
  weekdayName,
} from "./dates";

const date = (year: number, month: number, day: number) => ({ year, month, day });

describe("parseIsoDate", () => {
  it("reads pik's YYYY-MM-DD", () => {
    expect(parseIsoDate("2026-11-25")).toEqual(date(2026, 11, 25));
    expect(parseIsoDate("2024-02-29")).toEqual(date(2024, 2, 29));
  });

  it("rejects other forms and days that do not exist", () => {
    for (
      const text of ["2026-11-5", "25/11/2026", "2026-02-29", "2026-13-01", "", "2026-11-25T00:00"]
    ) {
      expect(parseIsoDate(text)).toBeNull();
    }
  });
});

describe("parseDateInput", () => {
  it("reads the day first, as in French and Spanish", () => {
    expect(parseDateInput("01/09/2026")).toEqual(date(2026, 9, 1));
    expect(parseDateInput("1/9/2026")).toEqual(date(2026, 9, 1));
    expect(parseDateInput(" 1-9-2026 ")).toEqual(date(2026, 9, 1));
    expect(parseDateInput("01.09.2026")).toEqual(date(2026, 9, 1));
  });

  it("reads the year first, as in Basque and in ISO dates", () => {
    expect(parseDateInput("2026/09/01")).toEqual(date(2026, 9, 1));
    expect(parseDateInput("2026-09-01")).toEqual(date(2026, 9, 1));
  });

  it("rejects text that is not a calendar date", () => {
    for (
      const text of [
        "",
        "septembre 2026",
        "31/02/2026",
        "1/9/26",
        "2026/9",
        "09/2026/01",
        "1/9/2026/1",
      ]
    ) {
      expect(parseDateInput(text)).toBeNull();
    }
  });

  it("round-trips the form the fields show", () => {
    expect(toDateInput(date(2026, 9, 1))).toBe("01/09/2026");
    expect(parseDateInput(toDateInput(date(2027, 6, 30)))).toEqual(date(2027, 6, 30));
  });
});

describe("date math", () => {
  it("writes the ISO form with leading zeros", () => {
    expect(toIsoDate(date(2026, 9, 1))).toBe("2026-09-01");
  });

  it("adds days across months, years and leap days", () => {
    expect(addDays(date(2026, 11, 30), 1)).toEqual(date(2026, 12, 1));
    expect(addDays(date(2026, 12, 31), 1)).toEqual(date(2027, 1, 1));
    expect(addDays(date(2024, 2, 28), 1)).toEqual(date(2024, 2, 29));
    expect(addDays(date(2026, 3, 1), -1)).toEqual(date(2026, 2, 28));
  });

  it("counts the days between two dates, across the DST changes", () => {
    expect(daysBetween(date(2026, 9, 1), date(2027, 9, 1))).toBe(365);
    expect(daysBetween(date(2027, 9, 1), date(2028, 9, 1))).toBe(366);
    expect(daysBetween(date(2026, 3, 28), date(2026, 3, 30))).toBe(2);
    expect(daysBetween(date(2026, 9, 2), date(2026, 9, 1))).toBe(-1);
  });

  it("gives ISO weekdays, Sunday being 7", () => {
    expect(isoWeekday(date(2026, 11, 23))).toBe(1);
    expect(isoWeekday(date(2026, 11, 25))).toBe(3);
    expect(isoWeekday(date(2026, 11, 29))).toBe(7);
  });

  it("reads today's date in the device's time zone", () => {
    expect(localToday(new Date(2026, 10, 23, 23, 59))).toEqual(date(2026, 11, 23));
  });
});

describe("weekdayDates", () => {
  it("starts on the first such weekday from the given date, then every week", () => {
    expect(weekdayDates(date(2026, 11, 23), 4, 2)).toEqual([date(2026, 11, 26), date(2026, 12, 3)]);
  });

  it("starts on the given date when it is that weekday", () => {
    expect(weekdayDates(date(2026, 11, 25), 3, 1)).toEqual([date(2026, 11, 25)]);
  });

  it("reaches Sunday", () => {
    expect(weekdayDates(date(2026, 11, 23), 7, 1)).toEqual([date(2026, 11, 29)]);
  });
});

describe("defaultSeason", () => {
  it("runs from today to the 30 June of the next year from July on", () => {
    expect(defaultSeason(date(2026, 7, 1))).toEqual({
      start: date(2026, 7, 1),
      end: date(2027, 6, 30),
    });
    expect(daysBetween(date(2026, 7, 1), date(2027, 6, 30))).toBeLessThanOrEqual(366);
  });

  it("ends on the 30 June of this year until June", () => {
    expect(defaultSeason(date(2027, 2, 10)).end).toEqual(date(2027, 6, 30));
    expect(defaultSeason(date(2027, 6, 30)).end).toEqual(date(2027, 6, 30));
  });
});

describe("names", () => {
  const names: DateNames = {
    weekdays: [
      "astelehena",
      "asteartea",
      "asteazkena",
      "osteguna",
      "ostirala",
      "larunbata",
      "igandea",
    ],
    weekdaysShort: [],
    months: [
      "urtarrila",
      "otsaila",
      "martxoa",
      "apirila",
      "maiatza",
      "ekaina",
      "uztaila",
      "abuztua",
      "iraila",
      "urria",
      "azaroa",
      "abendua",
    ],
    monthsShort: [],
  };

  it("names ISO weekdays from Monday", () => {
    expect(weekdayName(1, names.weekdays)).toBe("astelehena");
    expect(weekdayName(7, names.weekdays)).toBe("igandea");
  });

  it("names months from January", () => {
    expect(monthName(9, names.months)).toBe("iraila");
  });

  it("falls back to the number when a name is missing", () => {
    expect(weekdayName(3, names.weekdaysShort)).toBe("3");
  });
});

describe("parisTime", () => {
  const at = (instant: string) => parisTime(instant);

  it("reads a winter instant at UTC+1 and a summer one at UTC+2", () => {
    expect(at("2026-11-25T19:00:00Z")).toEqual({
      date: { year: 2026, month: 11, day: 25 },
      hour: 20,
      minute: 0,
    });
    expect(at("2027-06-15T17:30:00Z")).toEqual({
      date: { year: 2027, month: 6, day: 15 },
      hour: 19,
      minute: 30,
    });
  });

  // pik's deadline tests (src/domain/calendar/deadline.rs): 20:00 in Paris on each side of the
  // 2027 clock changes, Sunday 28 March and Sunday 31 October at 01:00 UTC.
  it.each(
    [
      ["2027-03-21T19:00:00Z", 21],
      ["2027-03-28T18:00:00Z", 28],
      ["2027-10-24T18:00:00Z", 24],
      ["2027-10-31T19:00:00Z", 31],
      ["2027-03-27T19:00:00Z", 27],
      ["2027-10-30T18:00:00Z", 30],
    ] as const,
  )("reads %s as 20:00 in Paris", (instant, day) => {
    expect(at(instant)).toMatchObject({ date: { day }, hour: 20, minute: 0 });
  });

  it("changes the offset at 01:00 UTC on the last Sundays of March and October", () => {
    expect(at("2027-03-28T00:59:00Z")).toMatchObject({ hour: 1, minute: 59 });
    expect(at("2027-03-28T01:00:00Z")).toMatchObject({ hour: 3, minute: 0 });
    expect(at("2027-10-31T00:30:00Z")).toMatchObject({ hour: 2, minute: 30 });
    expect(at("2027-10-31T01:30:00Z")).toMatchObject({ hour: 2, minute: 30 });
  });

  it("moves to the next Paris day after 23:00 UTC in winter", () => {
    expect(at("2026-12-31T23:30:00Z")).toEqual({
      date: { year: 2027, month: 1, day: 1 },
      hour: 0,
      minute: 30,
    });
  });

  it("takes an offset other than Z", () => {
    expect(at("2026-11-25T20:00:00+01:00")).toMatchObject({ hour: 20, minute: 0 });
  });

  it("is null for anything that is not an instant", () => {
    expect(at("2026-11-25")).toBeNull();
    expect(at("")).toBeNull();
    expect(at("2026-13-45T19:00:00Z")).toBeNull();
    expect(at("tomorrow")).toBeNull();
  });
});
