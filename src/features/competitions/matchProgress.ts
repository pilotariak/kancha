import type { Result } from "@/types/competition";

import { parseMatchScore } from "./matchScore";

export interface MatchProgress {
  played: number;
  total: number;
  /** Every match has a score. */
  finished: boolean;
}

/** A match counts as played once its score reads as sets, as on the match card. */
export function matchProgress(results: readonly Pick<Result, "scores">[]): MatchProgress {
  const played = results.filter((r) => parseMatchScore(r.scores) != null).length;
  const total = results.length;
  return { played, total, finished: total > 0 && played === total };
}
