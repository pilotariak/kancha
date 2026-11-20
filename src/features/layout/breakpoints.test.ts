import {
  CARD_WIDTH,
  columnsFor,
  gridWidth,
  RAIL_MIN_WIDTH,
  TEXT_MAX_WIDTH,
  webLayoutFor,
} from "./breakpoints";

describe("gridWidth", () => {
  it.each([
    [1, 390],
    [2, 752],
    [3, 1114],
    [4, 1476],
  ])("holds %i cards in %ipx", (columns, width) => {
    expect(gridWidth(columns)).toBe(width);
  });
});

describe("columnsFor", () => {
  it.each([
    [0, 1],
    [390, 1],
    [751, 1],
    [752, 2],
    [1113, 2],
    [1114, 3],
    [1475, 3],
    [1476, 4],
  ])("fits %ipx with %i columns", (width, columns) => {
    expect(columnsFor(width)).toBe(columns);
  });
});

describe("webLayoutFor", () => {
  it("shows the rail once two columns fit beside it", () => {
    expect(RAIL_MIN_WIDTH).toBe(880);
    expect(webLayoutFor(879)).toMatchObject({ rail: false, columns: 2, contentWidth: 879 });
    expect(webLayoutFor(880)).toMatchObject({ rail: true, columns: 2, contentWidth: 752 });
  });

  it.each(
    [
      [390, false, 1],
      [768, false, 2],
      [1024, true, 2],
      [1280, true, 3],
      [1920, true, 4],
    ] as const,
  )("lays %ipx out with rail %s and %i columns", (width, rail, columns) => {
    expect(webLayoutFor(width)).toMatchObject({ rail, columns });
  });

  it("never makes a cell narrower than the phone card", () => {
    for (let width = 752; width <= 2560; width++) {
      expect(webLayoutFor(width).cellWidth).toBeGreaterThanOrEqual(CARD_WIDTH);
    }
  });

  it("caps text at two cards", () => {
    expect(TEXT_MAX_WIDTH).toBe(752);
  });
});
