import { useMemo, useSyncExternalStore } from "react";
import { useColorScheme } from "react-native";

import { type ColorScheme, getPalette, type Palette } from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  isDark: boolean;
};

const subscribeNever = () => () => {};

/**
 * Resolves the active color scheme from the user's chosen mode
 * ("system" | "light" | "dark") and the OS appearance, then returns the
 * matching palette. Use in components so styles follow the active theme.
 */
export function useTheme(): Theme {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  // The static web render knows neither the browser appearance nor the saved
  // mode, so it is always light. While React hydrates that HTML, the server
  // snapshot (false) keeps the client on light too; React then re-renders with
  // the real scheme. Native never hydrates, so it always reads true.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  return useMemo(() => {
    const resolved: ColorScheme = mode === "system" ? (system ?? "light") : mode;
    const scheme: ColorScheme = hydrated ? resolved : "light";
    return { scheme, colors: getPalette(scheme), isDark: scheme === "dark" };
  }, [mode, system, hydrated]);
}

/**
 * Builds a memoized StyleSheet from a palette-aware factory, rebuilding only
 * when the active palette changes. Pattern: `const styles = useThemedStyles(makeStyles)`.
 */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
