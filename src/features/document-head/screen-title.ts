export const APP_NAME = "Kancha";

/**
 * i18n key of each screen's title, by route. Routes are Expo Router segments
 * without groups, so `(tabs)/competitions/list` is `competitions/list`.
 */
export const SCREEN_TITLE_KEYS: Readonly<Record<string, string>> = {
  competitions: "leagues.title",
  "competitions/list": "competitions.title",
  "competitions/specialty": "specialty.title",
  "competitions/category": "category.title",
  "competitions/details": "head.results",
  "competitions/new": "new_competition.title",
  "competitions/player": "player.title",
  "competitions/player-search": "player_search.title",
  score: "score.tab",
  profile: "tabs.about",
  slot: "tabs.slot",
  "slot/new": "tabs.slot",
  modal: "head.club_alerts",
  "+not-found": "head.not_found",
};

/** Returns the title key for the current route, or null when the app name alone fits. */
export function screenTitleKey(segments: readonly string[]): string | null {
  const route = segments
    .filter((segment) => !segment.startsWith("(") && segment !== "index")
    .join("/");
  return SCREEN_TITLE_KEYS[route] ?? null;
}
