import { layoutSizeFor } from "./breakpoints";

describe("layoutSizeFor", () => {
  it.each(
    [
      [0, "phone"],
      [390, "phone"],
      [599, "phone"],
      [600, "tablet"],
      [768, "tablet"],
      [1023, "tablet"],
      [1024, "desktop"],
      [1280, "desktop"],
    ] as const,
  )("maps %ipx to %s", (width, size) => {
    expect(layoutSizeFor(width)).toBe(size);
  });
});
