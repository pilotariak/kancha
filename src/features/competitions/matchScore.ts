export type Side = "A" | "B";

export interface SetScore {
  a: number;
  b: number;
}

export interface MatchScore {
  sets: SetScore[];
  /** The team that won more sets, or null when both won as many. */
  winner: Side | null;
}

const SET = /^(\d+)\/(\d+)$/;

/**
 * Reads Frontis scores, one "a/b" token per set ("07/15 04/15" is 7-15 then
 * 4-15). Returns null when there is no score, or when any token is not "a/b":
 * a partial score could name the wrong winner. A tied set counts for nobody.
 */
export function parseMatchScore(scores?: string | null): MatchScore | null {
  const tokens = scores?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (tokens.length === 0) return null;

  const sets: SetScore[] = [];
  for (const token of tokens) {
    const m = SET.exec(token);
    if (!m) return null;
    sets.push({ a: Number(m[1]), b: Number(m[2]) });
  }

  const wonA = sets.filter((s) => s.a > s.b).length;
  const wonB = sets.filter((s) => s.b > s.a).length;
  const winner = wonA > wonB ? "A" : wonB > wonA ? "B" : null;
  return { sets, winner };
}
