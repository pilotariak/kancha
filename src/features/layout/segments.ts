/**
 * How a segmented control sizes its segments, decided from its track's measured width, not the
 * window's: on wide web layouts the control sits in a grid cell.
 */

export const TRACK_PADDING = 3;
export const SEGMENT_GAP = 2;

/** A segment's two 8px sides. */
const SEGMENT_PADDING = 16;
/**
 * The longest label, "Clasificación" (es, 83px at 13px bold in Chrome on macOS), with 5px to
 * spare for native fonts.
 */
const LONGEST_LABEL = 88;
/** A 14px icon and the 6px gap before its label. */
const ICON_ROOM = 20;

/** The narrowest equal segment that holds every label: 104px, a 322px track for three. */
export const MIN_EQUAL_SEGMENT = SEGMENT_PADDING + LONGEST_LABEL;
/** The narrowest segment that keeps its icon beside every label: 124px. */
export const MIN_SEGMENT_WITH_ICON = MIN_EQUAL_SEGMENT + ICON_ROOM;

export interface SegmentFit {
  /**
   * Every segment gets the same width. Otherwise each takes its label's width and they share
   * what is left, so no label is cut.
   */
  equal: boolean;
  /** The segments show their icons beside their labels. */
  icons: boolean;
}

export function segmentFit(trackWidth: number, count: number): SegmentFit {
  const segment = (trackWidth - 2 * TRACK_PADDING - (count - 1) * SEGMENT_GAP) / count;
  return { equal: segment >= MIN_EQUAL_SEGMENT, icons: segment >= MIN_SEGMENT_WITH_ICON };
}
