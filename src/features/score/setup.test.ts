import {
  defaultTargetChoice,
  MAX_RECENT_TEAMS,
  parseTarget,
  recentTeamsFor,
  rememberTeams,
  targetOf,
} from "./setup";

describe("parseTarget", () => {
  it("reads any positive number", () => {
    expect(parseTarget("40")).toBe(40);
    expect(parseTarget("25")).toBe(25);
    expect(parseTarget("1")).toBe(1);
  });

  it("reads the number at the start of the text, as parseInt does", () => {
    expect(parseTarget("045")).toBe(45);
    expect(parseTarget("30 points")).toBe(30);
  });

  it("refuses an empty text, zero and negative numbers", () => {
    expect(parseTarget("")).toBeNull();
    expect(parseTarget("0")).toBeNull();
    expect(parseTarget("-5")).toBeNull();
    expect(parseTarget("abc")).toBeNull();
  });
});

describe("targetOf", () => {
  it("is null without a choice", () => {
    expect(targetOf(null)).toBeNull();
  });

  it("is the preset's value", () => {
    expect(targetOf({ kind: "preset", value: 35 })).toBe(35);
  });

  it("is the number typed in other, or null when it is not a positive number", () => {
    expect(targetOf({ kind: "other", text: "45" })).toBe(45);
    expect(targetOf({ kind: "other", text: "" })).toBeNull();
    expect(targetOf({ kind: "other", text: "0" })).toBeNull();
  });
});

describe("defaultTargetChoice", () => {
  it("selects nothing before the first match", () => {
    expect(defaultTargetChoice(null)).toBeNull();
  });

  it("selects the preset of the last target", () => {
    expect(defaultTargetChoice(30)).toEqual({ kind: "preset", value: 30 });
    expect(defaultTargetChoice(35)).toEqual({ kind: "preset", value: 35 });
    expect(defaultTargetChoice(40)).toEqual({ kind: "preset", value: 40 });
  });

  it("opens other with the last target when it is no preset", () => {
    expect(defaultTargetChoice(25)).toEqual({ kind: "other", text: "25" });
  });
});

describe("rememberTeams", () => {
  it("puts the match's teams first, team A before team B", () => {
    expect(rememberTeams([], ["Larralde", "Bielle"])).toEqual(["Larralde", "Bielle"]);
    expect(rememberTeams(["Etcheto"], ["Larralde", "Bielle"])).toEqual([
      "Larralde",
      "Bielle",
      "Etcheto",
    ]);
  });

  it("moves a team already there to the front, without a duplicate", () => {
    expect(rememberTeams(["Etcheto", "Bielle", "Ospital"], ["Bielle", "Larralde"])).toEqual([
      "Bielle",
      "Larralde",
      "Etcheto",
      "Ospital",
    ]);
  });

  it("matches names whatever their case and keeps the new spelling", () => {
    expect(rememberTeams(["larralde", "Bielle"], ["Larralde", "Etcheto"])).toEqual([
      "Larralde",
      "Etcheto",
      "Bielle",
    ]);
  });

  it("keeps one name when both teams have the same", () => {
    expect(rememberTeams([], ["Bielle", "bielle"])).toEqual(["Bielle"]);
  });

  it("trims names and drops empty ones", () => {
    expect(rememberTeams(["Ospital"], [" Larralde ", "  "])).toEqual(["Larralde", "Ospital"]);
  });

  it(`keeps the ${MAX_RECENT_TEAMS} most recent names`, () => {
    const recent = ["T1", "T2", "T3", "T4", "T5", "T6"];
    expect(rememberTeams(recent, ["A", "B"])).toEqual(["A", "B", "T1", "T2", "T3", "T4"]);
  });

  it("leaves the stored list untouched", () => {
    const recent = ["Etcheto"];
    rememberTeams(recent, ["Larralde", "Bielle"]);
    expect(recent).toEqual(["Etcheto"]);
  });
});

describe("recentTeamsFor", () => {
  const recent = ["Larralde", "Bielle", "Etcheto"];

  it("offers every recent team while the other field is empty", () => {
    expect(recentTeamsFor(recent, "")).toEqual(recent);
  });

  it("leaves out the team in the other field, whatever its case and spaces", () => {
    expect(recentTeamsFor(recent, "Bielle")).toEqual(["Larralde", "Etcheto"]);
    expect(recentTeamsFor(recent, " larralde ")).toEqual(["Bielle", "Etcheto"]);
  });

  it("keeps every team while the other field holds another name", () => {
    expect(recentTeamsFor(recent, "Biel")).toEqual(recent);
  });
});
