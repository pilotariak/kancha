import type { TFunction } from "i18next";

import type { PhaseType } from "@/components/BracketView";

export interface ParsedPhase {
  type: PhaseType;
  /**
   * The match number within its round: "Q 3" is the third quarter-final. 0 when the phase has
   * none: an FFPB round ("1/4 DE FINALE"), or a phase the parser does not know. No regional
   * league numbers a match 0.
   */
  number: number;
}

/** The order rounds are played in: the pools first, the final last, unknown phases after it. */
export const ROUND_ORDER: Record<PhaseType, number> = {
  P: 0,
  B: 1,
  BM: 2,
  B1T: 3,
  B2T: 4,
  B3T: 5,
  S: 6,
  H: 7,
  Q: 8,
  D: 9,
  F: 10,
  other: 11,
};

/**
 * The FFPB rounds: the league site's header, which Frontis stores whole, without a match number
 * (frontis `docs/reference/leagues.md`). Read as a whole text, so "1/2 FINALE" is no "FINALE".
 */
const FFPB_ROUNDS: ReadonlyMap<string, PhaseType> = new Map([
  ["1/16EME DE FINALE", "S"],
  ["1/8EME DE FINALE", "H"],
  ["1/4 DE FINALE", "Q"],
  ["1/2 FINALE", "D"],
  ["FINALE", "F"],
  ["BARRAGES MAINTIEN", "BM"],
  ["BARRAGE", "B"],
]);

/**
 * An FFPB pool match: "Poule 2" names the pool, not the match. The pool itself comes from
 * `Result.pool` (see `groupByPool`), never from this text.
 */
const FFPB_POOL = /^POULE \d+$/;

export function parsePhase(phase?: string): ParsedPhase {
  if (!phase) return { type: "other", number: 0 };
  // Match B1T/B2T/B3T, then BM (ctpb barrage maintien), then a bare B (ctpb
  // barrage), then single letters P/Q/D/F/H/S. Order matters: longer/more
  // specific patterns come first so "BM"/"B1T" aren't swallowed by bare "B".
  const m = phase.match(/(B[123]T|BM|B|[PQDFHS])\s*(\d+)\s*$/);
  if (m) return { type: m[1] as PhaseType, number: parseInt(m[2], 10) };
  // Only the phases the regional codes miss: no regional phase reads as an FFPB text.
  const text = phase.trim().replace(/\s+/g, " ").toUpperCase();
  if (FFPB_POOL.test(text)) return { type: "P", number: 0 };
  return { type: FFPB_ROUNDS.get(text) ?? "other", number: 0 };
}

/**
 * The label of a match card: "Q 3" reads "Quart de finale 3". `rounds_match.*` names one match,
 * in the singular, and places the number itself, since Basque puts it first; the plural
 * `rounds.*` titles the round divider. A pool match reads "Phase de poules", without its number:
 * "P 10" is the tenth match of the pool round, not a pool, and the pool card's title names the
 * pool (see `groupByPool`). A round without match numbers, as FFPB's "1/4 DE FINALE", reads
 * "Quart de finale" from `rounds_match_unnumbered.*`. A phase the parser does not know is shown
 * as Frontis sent it.
 */
export function matchPhaseLabel(phase: string | undefined, t: TFunction): string {
  const { type, number } = parsePhase(phase);
  if (type === "other") return phase ?? "";
  if (type === "P" || number > 0) return t(`rounds_match.${type}`, { number });
  return t(`rounds_match_unnumbered.${type}`);
}
