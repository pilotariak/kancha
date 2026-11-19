export type Palette = {
  /** Red text and icons. */
  red: string;
  /** Red surfaces under white text or icons: hero, score panel, buttons. */
  redFill: string;
  redDark: string;
  redSoft: string;
  white: string;
  cream: string;
  ink: string;
  text: string;
  muted: string;
  line: string;
  card: string;
  panel: string;
  green: string;
  greenSoft: string;
  shadow: string;
  amber: string;
  amberBg: string;
  /** Translucent white used for hero overlays on the red gradient. */
  onRedStrong: string;
  onRedSoft: string;
  /** Decorative circles floating in the hero gradient. */
  heroCircleOne: string;
  heroCircleTwo: string;
  /** Tab bar surfaces. */
  tabBar: string;
  tabBarBorder: string;
  tabIconInactive: string;
};

// Light palette — the original Kancha identity (cream canvas, Basque red).
export const KanchaColorsLight: Palette = {
  red: "#C8102E",
  redFill: "#C8102E",
  redDark: "#970D25",
  redSoft: "#FDE8EC",
  white: "#FFFFFF",
  cream: "#F7F4EF",
  ink: "#141414",
  text: "#262626",
  muted: "#7A7A7A",
  line: "#E5DED6",
  card: "#FFFDFC",
  panel: "#1E1E1E",
  green: "#1F7A5A",
  greenSoft: "#E6F4EE",
  shadow: "rgba(103, 18, 31, 0.14)",
  amber: "#C8900A",
  amberBg: "#FFF8E7",
  onRedStrong: "rgba(255,255,255,0.82)",
  onRedSoft: "rgba(255,255,255,0.78)",
  heroCircleOne: "rgba(255,255,255,0.08)",
  heroCircleTwo: "rgba(255,255,255,0.06)",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E9E0D6",
  tabIconInactive: "#B8B1AA",
};

// Dark palette — "Ikurriña": very dark forest-green surfaces, Basque red and
// white text, the colors of the Basque flag. Red is lifted for text on dark
// surfaces; redFill stays deep so white text on red keeps its contrast.
export const KanchaColorsDark: Palette = {
  red: "#F5586E",
  redFill: "#B5142F",
  redDark: "#6E0C1E",
  redSoft: "#36141B",
  white: "#1A2922",
  cream: "#0B1411",
  ink: "#F3F7F4",
  text: "#DCE6E0",
  muted: "#97A89F",
  line: "#25362E",
  card: "#13201A",
  panel: "#1E2E26",
  green: "#3CC489",
  greenSoft: "#12352A",
  shadow: "rgba(0, 8, 4, 0.50)",
  amber: "#E9AC2A",
  amberBg: "#2A240F",
  onRedStrong: "rgba(255,255,255,0.90)",
  onRedSoft: "rgba(255,255,255,0.80)",
  heroCircleOne: "rgba(255,255,255,0.06)",
  heroCircleTwo: "rgba(255,255,255,0.04)",
  tabBar: "#0F1A15",
  tabBarBorder: "#1F2D27",
  tabIconInactive: "#5E7268",
};

export type ColorScheme = "light" | "dark";

export function getPalette(scheme: ColorScheme): Palette {
  return scheme === "dark" ? KanchaColorsDark : KanchaColorsLight;
}

/**
 * Back-compat default palette (light). Prefer `useTheme()` in components so
 * colors follow the active scheme; this constant stays for non-reactive use.
 */
export const KanchaColors = KanchaColorsLight;

const Colors = {
  light: {
    text: KanchaColorsLight.text,
    background: KanchaColorsLight.cream,
    tint: KanchaColorsLight.red,
    tabIconDefault: KanchaColorsLight.tabIconInactive,
    tabIconSelected: KanchaColorsLight.red,
  },
  dark: {
    text: KanchaColorsDark.text,
    background: KanchaColorsDark.cream,
    tint: KanchaColorsDark.red,
    tabIconDefault: KanchaColorsDark.tabIconInactive,
    tabIconSelected: KanchaColorsDark.red,
  },
};

export default Colors;
