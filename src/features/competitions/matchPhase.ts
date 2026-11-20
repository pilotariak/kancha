import type { TFunction } from "i18next";

import type { PhaseType } from "@/components/BracketView";

export interface ParsedPhase {
  type: PhaseType;
  number: number;
}

export function parsePhase(phase?: string): ParsedPhase {
  if (!phase) return { type: "other", number: 0 };
  // Match B1T/B2T/B3T, then BM (ctpb barrage maintien), then a bare B (ctpb
  // barrage), then single letters P/Q/D/F/H/S. Order matters: longer/more
  // specific patterns come first so "BM"/"B1T" aren't swallowed by bare "B".
  const m = phase.match(/(B[123]T|BM|B|[PQDFHS])\s*(\d+)\s*$/);
  if (!m) return { type: "other", number: 0 };
  return { type: m[1] as PhaseType, number: parseInt(m[2], 10) };
}

/**
 * The label of a match card: "P 3" reads "Poule 3". `rounds_match.*` names one match, in the
 * singular, and places the number itself, since Basque puts it first ("3. taldea"); the plural
 * `rounds.*` titles the round divider. A phase the parser does not know is shown as Frontis sent it.
 */
export function matchPhaseLabel(phase: string | undefined, t: TFunction): string {
  const { type, number } = parsePhase(phase);
  return type === "other" ? phase ?? "" : t(`rounds_match.${type}`, { number });
}
