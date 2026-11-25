/**
 * The arithmetic of the session gauge (`SessionGauge`): OK answers solid, Dispo answers hatched,
 * the minimum as a line and the places at the end. The counts are pik's; the state the gauge
 * sits beside is pik's too. Dispo answers do not count toward the minimum (pilotariak/pik#3).
 */
export interface GaugeInput {
  ok: number;
  dispo: number;
  minPlayers: number;
  places: number;
}

export interface Gauge {
  /** Units across the bar: the places, or the minimum when a session has fewer places. */
  scale: number;
  /** OK answers drawn: the places hold them, the others wait. */
  ok: number;
  /** Dispo answers drawn, after the OK ones, in the places left. */
  dispo: number;
  /** Where the bar ends for each part and where the minimum stands, from 0 to 1. */
  okEnd: number;
  dispoEnd: number;
  minAt: number;
  /** OK answers beyond the places. */
  waiting: number;
  /** The boundaries between places, from 0 to 1: drawn when there are few enough to count. */
  ticks: number[];
}

/** Above this many places, the bar draws no tick between them. */
export const MAX_TICKS = 16;

const count = (value: number) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

export function gauge({ ok, dispo, minPlayers, places }: GaugeInput): Gauge {
  const okCount = count(ok);
  const dispoCount = count(dispo);
  const min = count(minPlayers);
  const scale = Math.max(count(places), min, 1);
  const okDrawn = Math.min(okCount, scale);
  const dispoDrawn = Math.min(dispoCount, scale - okDrawn);
  return {
    scale,
    ok: okDrawn,
    dispo: dispoDrawn,
    okEnd: okDrawn / scale,
    dispoEnd: (okDrawn + dispoDrawn) / scale,
    minAt: min / scale,
    waiting: Math.max(0, okCount - scale),
    ticks: scale <= MAX_TICKS
      ? Array.from({ length: scale - 1 }, (_, index) => (index + 1) / scale)
      : [],
  };
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * The hatching of the Dispo part, from `from` to `to` on a bar `height` high: lines at 45°,
 * `gap` apart, cut at both ends of the part. Plain segments rather than an SVG pattern, so that
 * iOS, Android and the web draw the same lines.
 */
export function hatchLines(from: number, to: number, height: number, gap: number): Segment[] {
  if (!(to > from) || !(height > 0) || !(gap > 0)) return [];
  const lines: Segment[] = [];
  // Each line rises from (x, height) to (x + height, 0); the first ones start left of `from`.
  for (let x = from - height; x < to; x += gap) {
    const start = Math.max(0, (from - x) / height);
    const end = Math.min(1, (to - x) / height);
    if (end <= start) continue;
    lines.push({
      x1: x + start * height,
      y1: height - start * height,
      x2: x + end * height,
      y2: height - end * height,
    });
  }
  return lines;
}
