import type { ReactElement } from "react";

import { type PictogramProps, PICTOGRAMS } from "./index";
import { Pictogram } from "./Pictogram";

type Drawing = (props: PictogramProps) => ReactElement<Record<string, unknown>>;

const frame = (props: PictogramProps) =>
  Pictogram({ ...props, children: null }) as ReactElement<Record<string, unknown>>;

describe("PICTOGRAMS", () => {
  it.each(Object.entries(PICTOGRAMS))("draws %s in the pictogram frame", (_key, drawing) => {
    expect((drawing as Drawing)({}).type).toBe(Pictogram);
  });

  it("has seven discipline drawings and three court drawings", () => {
    expect(new Set(Object.values(PICTOGRAMS)).size).toBe(10);
    expect(PICTOGRAMS.pgPleine).toBe(PICTOGRAMS.pgCreuse);
  });
});

describe("Pictogram", () => {
  it("draws on the lucide grid", () => {
    expect(frame({ color: "#141414", size: 20 }).props).toMatchObject({
      width: 20,
      height: 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#141414",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    });
  });

  it("defaults to lucide's color and size", () => {
    expect(frame({}).props).toMatchObject({ width: 24, stroke: "currentColor" });
  });

  it("scales the stroke as lucide does with absoluteStrokeWidth", () => {
    expect(frame({ size: 12, absoluteStrokeWidth: true }).props.strokeWidth).toBe(4);
  });

  it("stays hidden from screen readers", () => {
    expect(frame({ accessibilityElementsHidden: false }).props).toMatchObject({
      accessibilityElementsHidden: true,
      importantForAccessibility: "no-hide-descendants",
    });
  });
});
