import { type RefObject, useEffect, useRef, useState } from "react";
import {
  Platform,
  type PressableStateCallbackType,
  StyleSheet,
  type TextInput,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

const isWeb = Platform.OS === "web";

// React Native's types leave "none" out of outlineStyle; react-native-web passes it to CSS.
const noOutline = { outlineStyle: "none" } as unknown as TextStyle;

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
    // Text fields: a 2px red edge. The inset shadow draws the second pixel inside the 1px
    // border, so the field keeps its size.
    fieldFocus: { borderColor: c.red, boxShadow: `inset 0 0 0 1px ${c.red}` },
  });

/** Web hover and keyboard focus styles. Only web Pressables report these states. */
export function useInteractionStyles() {
  return useThemedStyles(makeStyles);
}

/**
 * A text field's focus on web, replacing the browser outline with a red edge. Typing goes to
 * the field however it was focused, so it shows after a click too: the field tracks its own
 * focus rather than `:focus-visible`. Spread `focusProps` on the TextInput and add `inputStyle`
 * to its style; put `focusStyle` last in the style of the element that draws the border, the
 * TextInput or the box around it. iOS and Android get no props and no styles. A field that
 * already has a ref passes it in, so the hook uses that ref instead of its own.
 */
export function useFieldFocus(inputRef?: RefObject<TextInput | null>) {
  const interaction = useInteractionStyles();
  const ownRef = useRef<TextInput>(null);
  const ref = inputRef ?? ownRef;
  const [focused, setFocused] = useState(false);

  // The browser can autofocus a field from the static HTML before React hydrates it, and that
  // focus never reaches onFocus: ask the field once hydrated.
  useEffect(() => {
    if (isWeb && ref.current?.isFocused()) setFocused(true);
  }, [ref]);

  const focusProps: Pick<TextInputProps, "onFocus" | "onBlur"> & { ref?: typeof ref } = isWeb
    ? { ref, onFocus: () => setFocused(true), onBlur: () => setFocused(false) }
    : {};

  return {
    focusProps,
    inputStyle: isWeb ? noOutline : null,
    focusStyle: isWeb && focused ? interaction.fieldFocus : null,
  };
}
