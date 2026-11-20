import { matchProgress } from "./matchProgress";

describe("matchProgress", () => {
  it("counts the matches with a score", () => {
    expect(matchProgress([{ scores: "07/15 04/15" }, { scores: undefined }, { scores: "" }]))
      .toEqual({
        played: 1,
        total: 3,
        finished: false,
      });
  });

  it("is finished once every match has a score", () => {
    expect(matchProgress([{ scores: "15/08 15/09" }, { scores: "35/24" }])).toEqual({
      played: 2,
      total: 2,
      finished: true,
    });
  });

  it("does not count a score that does not read as sets", () => {
    expect(matchProgress([{ scores: "forfait" }]).played).toBe(0);
  });

  it("is not finished without matches", () => {
    expect(matchProgress([])).toEqual({ played: 0, total: 0, finished: false });
  });
});
