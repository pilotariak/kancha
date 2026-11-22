/**
 * Pure helpers for the new match form (the Score tab): target presets and recent teams.
 * Free of React so they can be unit-tested; the screen and its store call them.
 */

/** Targets offered as buttons. Any other is typed in the "other" field. */
export const TARGET_PRESETS = [30, 35, 40] as const;

/** How many team names the form remembers. */
export const MAX_RECENT_TEAMS = 6;

/** The target picker's state: a preset, or "other" with the text typed in its field. */
export type TargetChoice = { kind: "preset"; value: number } | { kind: "other"; text: string };

/** A typed target: any positive number, read as `parseInt` reads it; null otherwise. */
export function parseTarget(text: string): number | null {
  const target = parseInt(text, 10);
  return target > 0 ? target : null;
}

/** The target a choice stands for, or null while there is none. */
export function targetOf(choice: TargetChoice | null): number | null {
  if (!choice) return null;
  return choice.kind === "preset" ? choice.value : parseTarget(choice.text);
}

/**
 * The choice the form opens on: the last target used, as its preset or typed in "other".
 * None before the first match.
 */
export function defaultTargetChoice(lastTarget: number | null): TargetChoice | null {
  if (lastTarget === null) return null;
  return (TARGET_PRESETS as readonly number[]).includes(lastTarget)
    ? { kind: "preset", value: lastTarget }
    : { kind: "other", text: String(lastTarget) };
}

function sameTeam(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}

/**
 * The recent teams once a match starts with `teams`: these first, in their order, then the
 * others, most recent first. A name already there, whatever its case, moves up with its new
 * spelling. Keeps `MAX_RECENT_TEAMS`.
 */
export function rememberTeams(recent: readonly string[], teams: readonly string[]): string[] {
  const next: string[] = [];
  for (const name of [...teams.map((team) => team.trim()), ...recent]) {
    if (name && !next.some((kept) => sameTeam(kept, name))) next.push(name);
  }
  return next.slice(0, MAX_RECENT_TEAMS);
}

/** The recent teams to offer under one field: all but the team in the other field. */
export function recentTeamsFor(recent: readonly string[], otherTeam: string): string[] {
  return recent.filter((name) => !sameTeam(name, otherTeam));
}
