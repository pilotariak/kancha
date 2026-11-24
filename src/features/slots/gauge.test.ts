import { gauge, hatchLines, MAX_TICKS } from "./gauge";

describe("gauge", () => {
  it("draws the OK answers, then the Dispo ones, against the places", () => {
    expect(gauge({ ok: 3, dispo: 2, minPlayers: 4, places: 8 })).toEqual({
      scale: 8,
      ok: 3,
      dispo: 2,
      okEnd: 3 / 8,
      dispoEnd: 5 / 8,
      minAt: 4 / 8,
      waiting: 0,
      ticks: [1, 2, 3, 4, 5, 6, 7].map((n) => n / 8),
    });
  });

  it("puts the minimum line where the OK answers reach it", () => {
    const at = gauge({ ok: 4, dispo: 0, minPlayers: 4, places: 6 });
    expect(at.okEnd).toBe(at.minAt);
    const under = gauge({ ok: 3, dispo: 1, minPlayers: 4, places: 6 });
    expect(under.okEnd).toBeLessThan(under.minAt);
    // The Dispo answers may cross the line: they do not count toward the minimum.
    expect(under.dispoEnd).toBeGreaterThanOrEqual(under.minAt);
  });

  it("keeps the extra OK answers out of the bar and leaves no room for Dispo", () => {
    expect(gauge({ ok: 7, dispo: 3, minPlayers: 4, places: 6 })).toMatchObject({
      ok: 6,
      dispo: 0,
      okEnd: 1,
      dispoEnd: 1,
      waiting: 1,
    });
  });

  it("fits the Dispo answers in the places left", () => {
    expect(gauge({ ok: 4, dispo: 5, minPlayers: 4, places: 6 })).toMatchObject({
      dispo: 2,
      dispoEnd: 1,
    });
  });

  it("stays drawable with odd values from a session", () => {
    expect(gauge({ ok: 0, dispo: 0, minPlayers: 0, places: 0 })).toMatchObject({
      scale: 1,
      okEnd: 0,
      minAt: 0,
      ticks: [],
    });
    expect(gauge({ ok: -1, dispo: Number.NaN, minPlayers: 4, places: 2 })).toMatchObject({
      scale: 4,
      ok: 0,
      dispo: 0,
      minAt: 1,
    });
  });

  it("draws no ticks when there are too many places to count", () => {
    expect(gauge({ ok: 1, dispo: 0, minPlayers: 2, places: MAX_TICKS }).ticks).toHaveLength(
      MAX_TICKS - 1,
    );
    expect(gauge({ ok: 1, dispo: 0, minPlayers: 2, places: MAX_TICKS + 1 }).ticks).toEqual([]);
  });
});

describe("hatchLines", () => {
  it("draws 45° lines cut at both ends of the part", () => {
    const lines = hatchLines(10, 30, 10, 6);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      for (const x of [line.x1, line.x2]) {
        expect(x).toBeGreaterThanOrEqual(10 - 1e-9);
        expect(x).toBeLessThanOrEqual(30 + 1e-9);
      }
      for (const y of [line.y1, line.y2]) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(10);
      }
      // 45°: as far across as up.
      expect(line.x2 - line.x1).toBeCloseTo(line.y1 - line.y2);
    }
  });

  it("starts a full line at the left edge once the part is wider than high", () => {
    expect(hatchLines(0, 20, 10, 10)).toEqual([
      { x1: 0, y1: 10, x2: 10, y2: 0 },
      { x1: 10, y1: 10, x2: 20, y2: 0 },
    ]);
  });

  it("draws nothing for an empty part", () => {
    expect(hatchLines(10, 10, 10, 6)).toEqual([]);
    expect(hatchLines(10, 20, 0, 6)).toEqual([]);
    expect(hatchLines(10, 20, 10, 0)).toEqual([]);
  });
});
