import {
  defaultDraft,
  firstInvalidStep,
  firstSession,
  firstSessionChoices,
  normalizeName,
  parseTimeInput,
  type SlotDraft,
  stepErrors,
  toCreateSlot,
  validateDraft,
  withMinPlayers,
  withPlaces,
} from "./wizard";

// Monday 23 November 2026.
const TODAY = { year: 2026, month: 11, day: 23 };

const valid = (changes: Partial<SlotDraft> = {}): SlotDraft => ({
  ...defaultDraft({
    start: { year: 2026, month: 9, day: 1 },
    end: { year: 2027, month: 6, day: 30 },
  }),
  name: "Mercredi soir",
  venue: "Trinquet Moderne",
  organizerName: "Maite",
  ...changes,
});

describe("defaultDraft", () => {
  it("starts from pik's defaults and the given season", () => {
    const draft = defaultDraft({
      start: { year: 2026, month: 11, day: 23 },
      end: { year: 2027, month: 6, day: 30 },
    });
    expect(draft).toMatchObject({
      seasonStart: "23/11/2026",
      seasonEnd: "30/06/2027",
      intervalWeeks: 1,
      minPlayers: 4,
      places: 4,
      deadlineDaysBefore: 1,
      deadlineTime: "20:00",
    });
  });
});

describe("toCreateSlot", () => {
  it("builds the body of POST /slots, every optional value included", () => {
    expect(toCreateSlot(valid({ name: "  Mercredi soir ", organizerName: " Maite  Etxe " }), TODAY))
      .toEqual({
        name: "Mercredi soir",
        venue: "Trinquet Moderne",
        court: "trinquet",
        specialty: "gomme_creuse",
        anchor_date: "2026-11-25",
        interval_weeks: 1,
        time_from: "18:00",
        time_to: "20:00",
        season_start: "2026-09-01",
        season_end: "2027-06-30",
        min_players: 4,
        places: 4,
        deadline_days_before: 1,
        deadline_time: "20:00",
        organizer_name: "Maite Etxe",
      });
  });

  it("sends no end time when the field is empty, and normalizes the times", () => {
    const body = toCreateSlot(valid({ timeFrom: "9h30", timeTo: " ", deadlineTime: "12h" }), TODAY);
    expect(body).toMatchObject({ time_from: "09:30", time_to: null, deadline_time: "12:00" });
  });

  it("leaves the number of points of a game to pik", () => {
    expect(toCreateSlot(valid(), TODAY)).not.toHaveProperty("target");
  });

  it("is null while a field has an error", () => {
    expect(toCreateSlot(valid({ name: "" }), TODAY)).toBeNull();
  });
});

describe("validateDraft", () => {
  it("accepts a complete draft", () => {
    expect(validateDraft(valid(), TODAY)).toEqual({});
  });

  it("checks the slot name and the venue like pik", () => {
    expect(validateDraft(valid({ name: "   " }), TODAY).name).toEqual({ code: "required" });
    expect(validateDraft(valid({ name: "é".repeat(60) }), TODAY).name).toBeUndefined();
    expect(validateDraft(valid({ name: "é".repeat(61) }), TODAY).name)
      .toEqual({ code: "too_long", max: 60 });
    expect(validateDraft(valid({ venue: "v".repeat(81) }), TODAY).venue)
      .toEqual({ code: "too_long", max: 80 });
    expect(validateDraft(valid({ venue: `Trinquet${String.fromCharCode(7)}` }), TODAY).venue)
      .toEqual({ code: "control_characters" });
  });

  it("counts characters, not UTF-16 units", () => {
    expect(validateDraft(valid({ name: "🎾".repeat(60) }), TODAY).name).toBeUndefined();
  });

  it("checks the organizer's name like a member's name", () => {
    expect(validateDraft(valid({ organizerName: " \t " }), TODAY).organizerName)
      .toEqual({ code: "required" });
    expect(validateDraft(valid({ organizerName: "a".repeat(41) }), TODAY).organizerName)
      .toEqual({ code: "too_long", max: 40 });
    // A line break is white space, collapsed before the length counts.
    expect(validateDraft(valid({ organizerName: `${"a".repeat(20)}\n${"b".repeat(19)}` }), TODAY))
      .toEqual({});
  });

  it("checks the season dates", () => {
    expect(validateDraft(valid({ seasonStart: "" }), TODAY).seasonStart)
      .toEqual({ code: "required" });
    expect(validateDraft(valid({ seasonStart: "31/02/2026" }), TODAY).seasonStart)
      .toEqual({ code: "invalid_date" });
    expect(validateDraft(valid({ seasonEnd: "31/08/2026" }), TODAY).seasonEnd)
      .toEqual({ code: "season_order" });
    expect(
      validateDraft(valid({ seasonStart: "01/09/2026", seasonEnd: "03/09/2027" }), TODAY).seasonEnd,
    )
      .toEqual({ code: "season_too_long", max: 366 });
    expect(validateDraft(valid({ seasonStart: "23/11/2026", seasonEnd: "24/11/2027" }), TODAY))
      .toEqual({});
  });

  it("wants a first session within the season", () => {
    // The season ends before the first Wednesday from today.
    expect(
      validateDraft(valid({ seasonStart: "01/09/2026", seasonEnd: "24/11/2026" }), TODAY)
        .anchorDate,
    )
      .toEqual({ code: "no_session" });
    // A season that is over has no session left.
    expect(
      validateDraft(valid({ seasonStart: "01/01/2026", seasonEnd: "30/06/2026" }), TODAY)
        .anchorDate,
    )
      .toEqual({ code: "no_session" });
  });

  it("checks the times", () => {
    expect(validateDraft(valid({ timeFrom: "" }), TODAY).timeFrom).toEqual({ code: "required" });
    expect(validateDraft(valid({ timeFrom: "24:00" }), TODAY).timeFrom)
      .toEqual({ code: "invalid_time" });
    expect(validateDraft(valid({ timeTo: "17:59" }), TODAY).timeTo).toEqual({ code: "time_order" });
    expect(validateDraft(valid({ timeTo: "18:00" }), TODAY).timeTo).toEqual({ code: "time_order" });
    expect(validateDraft(valid({ deadlineTime: "noon" }), TODAY).deadlineTime)
      .toEqual({ code: "invalid_time" });
  });

  it("checks the numbers", () => {
    expect(validateDraft(valid({ minPlayers: 0 }), TODAY).minPlayers)
      .toEqual({ code: "out_of_range", min: 1, max: 30 });
    expect(validateDraft(valid({ minPlayers: 6, places: 5 }), TODAY).places)
      .toEqual({ code: "out_of_range", min: 6, max: 30 });
    expect(validateDraft(valid({ places: 31 }), TODAY).places)
      .toEqual({ code: "out_of_range", min: 4, max: 30 });
    expect(validateDraft(valid({ deadlineDaysBefore: 7 }), TODAY).deadlineDaysBefore)
      .toEqual({ code: "out_of_range", min: 0, max: 6 });
  });
});

describe("steps", () => {
  it("lists the errors of one step only", () => {
    const draft = valid({ name: "", timeFrom: "", organizerName: "" });
    expect(Object.keys(stepErrors(draft, "slot", TODAY))).toEqual(["name"]);
    expect(Object.keys(stepErrors(draft, "frequency", TODAY))).toEqual(["timeFrom"]);
    expect(Object.keys(stepErrors(draft, "players", TODAY))).toEqual(["organizerName"]);
    expect(stepErrors(draft, "summary", TODAY)).toEqual({});
  });

  it("finds the first step to fix", () => {
    expect(firstInvalidStep(valid({ organizerName: "" }), TODAY)).toBe("players");
    expect(firstInvalidStep(valid({ timeFrom: "", organizerName: "" }), TODAY)).toBe("frequency");
    expect(firstInvalidStep(valid(), TODAY)).toBeNull();
  });
});

describe("first session", () => {
  it("offers the next weekday from today during the season", () => {
    expect(firstSessionChoices(valid({ weekday: 4 }), TODAY))
      .toEqual([{ year: 2026, month: 11, day: 26 }]);
  });

  it("offers the next weekday from the season start before the season", () => {
    expect(
      firstSessionChoices(valid({ seasonStart: "01/09/2027", seasonEnd: "30/06/2028" }), TODAY),
    )
      .toEqual([{ year: 2027, month: 9, day: 1 }]);
  });

  it("offers this week or the next one every other week", () => {
    const draft = valid({ intervalWeeks: 2 });
    expect(firstSessionChoices(draft, TODAY)).toEqual([
      { year: 2026, month: 11, day: 25 },
      { year: 2026, month: 12, day: 2 },
    ]);
    expect(firstSession({ ...draft, anchorDate: "2026-12-02" }, TODAY))
      .toEqual({ year: 2026, month: 12, day: 2 });
    expect(toCreateSlot({ ...draft, anchorDate: "2026-12-02" }, TODAY)?.anchor_date)
      .toBe("2026-12-02");
  });

  it("falls back to the first choice when the picked date is no longer offered", () => {
    expect(firstSession(valid({ weekday: 5, anchorDate: "2026-12-02" }), TODAY))
      .toEqual({ year: 2026, month: 11, day: 27 });
  });

  it("offers none while the season start is not a date", () => {
    expect(firstSessionChoices(valid({ seasonStart: "soon" }), TODAY)).toEqual([]);
  });
});

describe("parseTimeInput", () => {
  it.each([
    ["18:00", "18:00"],
    ["9:05", "09:05"],
    ["18h30", "18:30"],
    ["18h", "18:00"],
    ["18H", "18:00"],
    [" 7.45 ", "07:45"],
    ["00:00", "00:00"],
    ["23:59", "23:59"],
  ])("reads %j as %j", (text, time) => {
    expect(parseTimeInput(text)).toBe(time);
  });

  it.each(["", "18", "1830", "24:00", "18:60", "18:5", "six"])("rejects %j", (text) => {
    expect(parseTimeInput(text)).toBeNull();
  });
});

describe("normalizeName", () => {
  it("collapses white space and composes accents, as pik does", () => {
    expect(normalizeName("  Peio\t Etxe ")).toBe("Peio Etxe");
    expect(normalizeName(`Jose${String.fromCharCode(0x301)}`)).toBe("José");
  });
});

describe("players", () => {
  it("raises the places with the minimum", () => {
    expect(withMinPlayers(valid({ minPlayers: 4, places: 4 }), 6)).toMatchObject({
      minPlayers: 6,
      places: 6,
    });
    expect(withMinPlayers(valid({ minPlayers: 4, places: 8 }), 6)).toMatchObject({
      minPlayers: 6,
      places: 8,
    });
  });

  it("keeps the minimum and the places within pik's bounds", () => {
    expect(withMinPlayers(valid(), 0).minPlayers).toBe(1);
    expect(withMinPlayers(valid(), 31)).toMatchObject({ minPlayers: 30, places: 30 });
    expect(withPlaces(valid({ minPlayers: 4 }), 3).places).toBe(4);
    expect(withPlaces(valid(), 31).places).toBe(30);
  });
});
