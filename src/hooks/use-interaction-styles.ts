import { Platform, type PressableStateCallbackType, StyleSheet } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

/**
 * Pressable's state. On web, react-native-web also passes `hovered` and `focused` to the
 * style and children callbacks; React Native's types only declare `pressed`.
 */
export type InteractionState = PressableStateCallbackType & {
  hovered?: boolean;
  focused?: boolean;
};

/**
 * Whether the focused element shows keyboard focus. A mouse click also focuses a Pressable on
 * web, so `focused` alone would leave a ring on every clicked chip; the browser's
 * `:focus-visible` keeps it to keyboard focus. Call it when `focused` is true.
 */
export function isFocusVisible(): boolean {
  return Platform.OS === "web" && typeof document !== "undefined"
    && document.activeElement?.matches(":focus-visible") === true;
}

/** The ring to draw for this state: keyboard focus only. */
export function showsFocusRing({ focused }: InteractionState): boolean {
  return focused === true && isFocusVisible();
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    // Cards and fields: a darker border and a light shadow from the shadow token.
    hover: { borderColor: c.lineStrong, boxShadow: `0 4px 16px ${c.shadow}` },
    // Chips: the darker border only, as a scrolling row would clip the shadow.
    hoverBorder: { borderColor: c.lineStrong },
    focusRing: { outlineColor: c.red, outlineStyle: "solid", outlineWidth: 2, outlineOffset: 2 },
  });

/** Web hover and keyboard focus styles. Only web Pressables report these states. */
export function useInteractionStyles() {
  return useThemedStyles(makeStyles);
}
