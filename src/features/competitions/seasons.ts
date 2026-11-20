import type { Competition } from "@/types/competition";

/** A season over two consecutive years, such as 2025-2026. */
export interface Season {
  start: number;
  end: number;
}

export interface SeasonCompetition {
  competition: Competition;
  /** The name without its season: "Championnat CCAPB" for "Championnat 2018-2019 CCAPB". */
  label: string;
}

export interface SeasonGroup {
  season: Season;
  competitions: SeasonCompetition[];
}

export interface CompetitionSeasons {
  /** The most recent season found in the names, whatever today's date. */
  current: SeasonGroup;
  /** The older seasons, most recent first. */
  previous: SeasonGroup[];
  /** Competitions whose name holds no season, in API order. */
  others: Competition[];
}

/** The number of previous seasons shown before "All seasons". */
export const VISIBLE_PREVIOUS_SEASONS = 6;

// Frontis has no season field, so read it from the name. The season sits anywhere in it:
// "Championnat CCAPB 2025-2026", "Championnat 2018-2019 CCAPB", "Championnat d'Hiver 2025/2026",
// "Compétition 2021-2022(Ext)". A single year ("Championnat été 2025") is not a season.
const SEASON_PATTERN = /(^|\D)(\d{4})\s*[-/]\s*(\d{4})(?!\d)/;

export function parseSeason(name: string): { season: Season; label: string } | null {
  const match = SEASON_PATTERN.exec(name);
  if (!match) return null;
  const start = Number(match[2]);
  const end = Number(match[3]);
  if (end !== start + 1) return null;
  const from = match.index + match[1].length;
  const label = `${name.slice(0, from)} ${name.slice(match.index + match[0].length)}`
    .replace(/\s+/g, " ")
    .trim();
  return { season: { start, end }, label: label || name };
}

export function formatSeason(season: Season): string {
  return `${season.start}-${season.end}`;
}

/**
 * Joins the years of a season with word joiners (U+2060), so a wrapped name never breaks
 * after "2025-": "Compétition 2025-2026" wraps before the season instead. Display only.
 */
export function keepSeasonTogether(name: string): string {
  return name.replace(/(\d{4})\s*([-/])\s*(\d{4})/g, "$1\u2060$2\u2060$3");
}

/**
 * Groups competitions by the season in their name, most recent first, and orders the
 * competitions of a season by label. Returns null when no name holds a season: the
 * screen then keeps its plain list.
 */
export function groupBySeason(competitions: Competition[]): CompetitionSeasons | null {
  const groups = new Map<number, SeasonGroup>();
  const others: Competition[] = [];

  for (const competition of competitions) {
    const parsed = parseSeason(competition.name);
    if (!parsed) {
      others.push(competition);
      continue;
    }
    const group = groups.get(parsed.season.start);
    if (group) group.competitions.push({ competition, label: parsed.label });
    else {
      groups.set(parsed.season.start, {
        season: parsed.season,
        competitions: [{ competition, label: parsed.label }],
      });
    }
  }

  const [current, ...previous] = [...groups.values()]
    .sort((a, b) => b.season.start - a.season.start)
    .map((group) => ({
      ...group,
      competitions: [...group.competitions].sort((a, b) => a.label.localeCompare(b.label)),
    }));

  return current ? { current, previous, others } : null;
}

/**
 * How the season grid lays out seasons: consecutive one-competition seasons share a grid of
 * season tiles, and a season with several competitions gets its own heading and one tile each.
 */
export type SeasonBlock =
  | { kind: "seasons"; groups: SeasonGroup[] }
  | { kind: "season"; group: SeasonGroup };

export function toSeasonBlocks(groups: SeasonGroup[]): SeasonBlock[] {
  const blocks: SeasonBlock[] = [];
  for (const group of groups) {
    const last = blocks[blocks.length - 1];
    if (group.competitions.length > 1) blocks.push({ kind: "season", group });
    else if (last?.kind === "seasons") last.groups.push(group);
    else blocks.push({ kind: "seasons", groups: [group] });
  }
  return blocks;
}

/** Cuts the previous seasons after `limit` seasons, whatever the number of competitions in each. */
export function splitPreviousSeasons(
  previous: SeasonGroup[],
  limit = VISIBLE_PREVIOUS_SEASONS,
): { shown: SeasonGroup[]; hidden: SeasonGroup[] } {
  return { shown: previous.slice(0, limit), hidden: previous.slice(limit) };
}
