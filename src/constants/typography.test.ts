import { scoreColumnWidth, scoreDigits } from "./typography";

describe("scoreColumnWidth", () => {
  it("fits two tabular digits of the Black face (540/1000 em)", () => {
    expect(scoreColumnWidth(17)).toBe(19);
    expect(scoreColumnWidth(22)).toBe(24);
    expect(scoreColumnWidth(28)).toBe(31);
    expect(scoreColumnWidth(22)).toBeGreaterThanOrEqual(2 * 0.54 * 22);
  });
});

describe("scoreDigits", () => {
  it("sets the face through the family, never a fontWeight", () => {
    for (const style of Object.values(scoreDigits)) {
      expect(style).not.toHaveProperty("fontWeight");
      expect(style.fontVariant).toEqual(["tabular-nums"]);
    }
  });
});
