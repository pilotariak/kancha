import { MIN_EQUAL_SEGMENT, MIN_SEGMENT_WITH_ICON, segmentFit } from "./segments";

/** The track that gives three segments of `segment` px: 3px padding, 2px gaps. */
const trackFor = (segment: number) => 3 * segment + 2 * 3 + 2 * 2;

describe("segmentFit", () => {
  it("keeps the documented thresholds", () => {
    expect(MIN_EQUAL_SEGMENT).toBe(104);
    expect(MIN_SEGMENT_WITH_ICON).toBe(124);
  });

  it.each([
    // A phone: the screen less its two 20px gutters.
    ["a 320px phone", 280, { equal: false, icons: false }],
    ["a 360px phone", 320, { equal: false, icons: false }],
    ["a 375px phone", 335, { equal: true, icons: false }],
    ["a 390px phone", 350, { equal: true, icons: false }],
    // A grid cell is a phone card wide at least.
    ["the narrowest grid cell", 350, { equal: true, icons: false }],
    ["a 382px cell", 382, { equal: true, icons: true }],
  ])("sizes three segments in %s (%ipx track)", (_, track, fit) => {
    expect(segmentFit(track, 3)).toEqual(fit);
  });

  it("gives equal segments from 104px each", () => {
    expect(segmentFit(trackFor(104), 3).equal).toBe(true);
    expect(segmentFit(trackFor(103.9), 3).equal).toBe(false);
  });

  it("shows icons from 124px each", () => {
    expect(segmentFit(trackFor(124), 3)).toEqual({ equal: true, icons: true });
    expect(segmentFit(trackFor(123.9), 3)).toEqual({ equal: true, icons: false });
  });

  it("splits the track among any number of segments", () => {
    expect(segmentFit(2 * 104 + 2 * 3 + 2, 2)).toEqual({ equal: true, icons: false });
    expect(segmentFit(4 * 104 + 2 * 3 + 3 * 2 - 1, 4)).toEqual({ equal: false, icons: false });
  });
});
