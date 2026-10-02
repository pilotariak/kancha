import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { type ColorScheme, getPalette, type Palette } from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  isDark: boolean;
};

/**
 * Resolves the active color scheme from the user's chosen mode
 * ("system" | "light" | "dark") and the OS appearance, then returns the
 * matching palette. Use in components so styles follow the active theme.
 */
export function useTheme(): Theme {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();

  return useMemo(() => {
    const scheme: ColorScheme = mode === "system" ? (system ?? "light") : mode;
    return { scheme, colors: getPalette(scheme), isDark: scheme === "dark" };
  }, [mode, system]);
}

/**
 * Builds a memoized StyleSheet from a palette-aware factory, rebuilding only
 * when the active palette changes. Pattern: `const styles = useThemedStyles(makeStyles)`.
 */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
