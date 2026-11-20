import { parseMatchScore } from "./matchScore";

// Scores below come from Frontis: lcapb competition 502 and lidfpb competition 1.
describe("parseMatchScore", () => {
  it("reads two sets, one column per set, and names the team that won both", () => {
    expect(parseMatchScore("07/15 04/15")).toEqual({
      sets: [{ a: 7, b: 15 }, { a: 4, b: 15 }],
      winner: "B",
    });
    expect(parseMatchScore("15/08 15/09")?.winner).toBe("A");
  });

  it("reads three sets and names the team that won two of them", () => {
    expect(parseMatchScore("09/15 15/10 02/10")).toEqual({
      sets: [{ a: 9, b: 15 }, { a: 15, b: 10 }, { a: 2, b: 10 }],
      winner: "B",
    });
    expect(parseMatchScore("13/15 15/12 10/05")?.winner).toBe("A");
  });

  it("reads a single set", () => {
    expect(parseMatchScore("35/24")).toEqual({ sets: [{ a: 35, b: 24 }], winner: "A" });
    expect(parseMatchScore("34/35")?.winner).toBe("B");
  });

  it("names no winner when both teams won as many sets", () => {
    expect(parseMatchScore("15/10 10/15")?.winner).toBeNull();
    expect(parseMatchScore("15/15")).toEqual({ sets: [{ a: 15, b: 15 }], winner: null });
  });

  it("does not count a tied set", () => {
    expect(parseMatchScore("15/15 15/10")?.winner).toBe("A");
  });

  it("ignores surrounding and repeated whitespace", () => {
    expect(parseMatchScore("  07/15\t 04/15 ")?.sets).toEqual([{ a: 7, b: 15 }, { a: 4, b: 15 }]);
  });

  it.each([undefined, null, "", "   "])("returns null when the score is missing: %j", (input) => {
    expect(parseMatchScore(input)).toBeNull();
  });

  it.each([
    "FORFAIT",
    "15-10",
    "15/",
    "/10",
    "15/10/5",
    "15/x",
    "1.5/10",
    "-1/10",
    "15/10 abc",
    "15/10 15-08",
  ])("returns null for malformed input %j", (input) => {
    expect(parseMatchScore(input)).toBeNull();
  });
});
