export type Palette = {
  red: string;
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

// Dark palette — "fronton at night": warm near-black stone, red identity kept,
// cream flips to become text. Reds/greens lifted for contrast on dark surfaces.
export const KanchaColorsDark: Palette = {
  red: "#E63950",
  redDark: "#7E0A1E",
  redSoft: "#3A1A20",
  white: "#2E251F",
  cream: "#17120F",
  ink: "#F7F4EF",
  text: "#E8E2DB",
  muted: "#A69E95",
  line: "#3A302A",
  card: "#241C18",
  panel: "#0E0B09",
  green: "#3FA87E",
  greenSoft: "#163026",
  shadow: "rgba(0, 0, 0, 0.45)",
  amber: "#E0A419",
  amberBg: "#2E2410",
  onRedStrong: "rgba(255,255,255,0.90)",
  onRedSoft: "rgba(255,255,255,0.80)",
  heroCircleOne: "rgba(255,255,255,0.06)",
  heroCircleTwo: "rgba(255,255,255,0.04)",
  tabBar: "#1C1511",
  tabBarBorder: "#2C231D",
  tabIconInactive: "#6F665E",
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
