import { type DatedMatch, formatMatchDay, groupByDay } from "./matchDays";

type Match = DatedMatch & { id: string };

const match = (id: string, dateMatch?: string, scores?: string): Match => ({
  id,
  dateMatch,
  scores,
});
const ids = (days: { results: Match[] }[]) => days.map((d) => d.results.map((r) => r.id));

// Months are 0-based in the Date constructor: this is 20 November 2026, 10:00 local time.
const now = new Date(2026, 10, 20, 10, 0);

describe("groupByDay", () => {
  // Shaped on lcapb competition 500, Mur à Gauche / P.G. Pleine Feminine, 1ère Série: three pool
  // matches each Sunday.
  const pools = [
    match("p1", "06/09/2026", "35/25"),
    match("p2", "06/09/2026", "20/35"),
    match("p3", "06/09/2026", "35/10"),
    match("p4", "13/09/2026", "35/25"),
    match("p5", "13/09/2026", "35/21"),
    match("p6", "13/09/2026", "35/12"),
  ];

  it("puts the matches of a day together, one group per day", () => {
    const [days] = groupByDay([pools], now);
    expect(days.map((d) => d.key)).toEqual(["2026-09-06", "2026-09-13"]);
    expect(days[0].date).toEqual({ year: 2026, month: 9, day: 6 });
    expect(ids(days)).toEqual([["p1", "p2", "p3"], ["p4", "p5", "p6"]]);
  });

  it("orders the days by date and keeps the order of the matches within a day", () => {
    const [days] = groupByDay([
      [
        match("b", "13/09/2026"),
        match("a", "06/09/2026"),
        match("c", "13/09/2026"),
        match("d", "04/10/2025"),
      ],
    ], now);
    expect(days.map((d) => d.key)).toEqual(["2025-10-04", "2026-09-06", "2026-09-13"]);
    expect(ids(days)).toEqual([["d"], ["a"], ["b", "c"]]);
  });

  it("reads the same day however Frontis writes it", () => {
    const [days] = groupByDay([[match("a", "6/9/2026"), match("b", "06/09/2026 ")]], now);
    expect(ids(days)).toEqual([["a", "b"]]);
  });

  it("puts the matches without a readable date in a last group", () => {
    const [days] = groupByDay([
      [
        match("none"),
        match("blank", ""),
        match("tbd", "TBD"),
        match("dated", "13/09/2026"),
      ],
    ], now);
    expect(days.map((d) => d.key)).toEqual(["2026-09-13", "later"]);
    expect(days[1].date).toBeNull();
    expect(days[1].today).toBe(false);
    expect(ids(days)).toEqual([["dated"], ["none", "blank", "tbd"]]);
  });

  it("returns one list per round, so a day shared by two rounds shows in both", () => {
    const rounds = groupByDay([
      [match("p1", "25/10/2026", "35/21")],
      [match("d1", "25/10/2026", "35/20"), match("d2", "31/10/2026")],
      [],
    ], now);
    expect(rounds.map(ids)).toEqual([[["p1"]], [["d1"], ["d2"]], []]);
  });

  it("returns no day for no match", () => {
    expect(groupByDay([], now)).toEqual([]);
    expect(groupByDay([[]], now)).toEqual([[]]);
  });

  describe("open days", () => {
    const open = (days: { key: string; open: boolean }[]) =>
      days.filter((d) => d.open).map((d) => d.key);

    it("keeps the most recent day with a score open and collapses the days before it", () => {
      const [days] = groupByDay([pools], now);
      expect(open(days)).toEqual(["2026-09-13"]);
    });

    it("finds the most recent day with a score across every round", () => {
      const [poolDays, finalDays] = groupByDay([pools, [match("f1", "31/10/2026", "20/35")]], now);
      expect(open(poolDays)).toEqual([]);
      expect(open(finalDays)).toEqual(["2026-10-31"]);
    });

    it("keeps the days after the most recent one with a score open, played or not", () => {
      const [days] = groupByDay([[
        ...pools,
        match("p7", "20/09/2026"),
        match("p10", "27/12/2026"),
        match("later"),
      ]], now);
      expect(open(days)).toEqual(["2026-09-13", "2026-09-20", "2026-12-27", "later"]);
    });

    it("keeps today open, even before the most recent day with a score", () => {
      const [days] = groupByDay([[
        match("a", "13/11/2026", "35/20"),
        match("b", "20/11/2026"),
        match("c", "27/11/2026", "35/30"),
      ]], now);
      expect(days.map((d) => [d.key, d.today, d.open])).toEqual([
        ["2026-11-13", false, false],
        ["2026-11-20", true, true],
        ["2026-11-27", false, true],
      ]);
    });

    it("counts a day as played when one of its matches has a score that reads as sets", () => {
      const [days] = groupByDay([[
        match("a", "06/09/2026", "35/25"),
        match("b", "13/09/2026", "forfait"),
        match("c", "13/09/2026"),
      ]], now);
      expect(open(days)).toEqual(["2026-09-06", "2026-09-13"]);
    });

    it("keeps every day open before the first score", () => {
      const [days] = groupByDay([[
        match("a", "06/09/2026"),
        match("b", "13/09/2026"),
        match("c"),
      ]], now);
      expect(open(days)).toEqual(["2026-09-06", "2026-09-13", "later"]);
    });

    it("ignores the score of a match without a date", () => {
      const [days] = groupByDay([[match("a", "06/09/2026"), match("b", undefined, "35/20")]], now);
      expect(open(days)).toEqual(["2026-09-06", "later"]);
    });
  });

  it("marks today with the local calendar date of now", () => {
    const days = (at: Date) => groupByDay([[match("a", "20/11/2026")]], at)[0];
    expect(days(new Date(2026, 10, 20, 0, 0))[0].today).toBe(true);
    expect(days(new Date(2026, 10, 20, 23, 59))[0].today).toBe(true);
    expect(days(new Date(2026, 10, 21, 0, 0))[0].today).toBe(false);
  });
});

describe("formatMatchDay", () => {
  // ICU versions differ in spaces and words (Basque in Node and Bun), so compare with Intl itself.
  const long = (locale: string, date: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" })
      .format(date);
  const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  it.each(["en", "fr", "es", "eu"])("writes the weekday, day and month in full in %s", (locale) => {
    expect(formatMatchDay({ year: 2026, month: 9, day: 13 }, locale)).toBe(
      capitalized(long(locale, new Date(2026, 8, 13))),
    );
  });

  it("starts with a capital", () => {
    expect(formatMatchDay({ year: 2026, month: 9, day: 13 }, "fr")).toBe("Dimanche 13 septembre");
    expect(formatMatchDay({ year: 2026, month: 9, day: 13 }, "es")).toMatch(/^Domingo/);
    expect(formatMatchDay({ year: 2026, month: 9, day: 13 }, "en")).toBe("Sunday, September 13");
  });
});
