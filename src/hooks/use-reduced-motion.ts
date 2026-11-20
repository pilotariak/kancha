import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Calls `onChange` with the system "reduce motion" setting, then on every change, until the
 * returned function is called. iOS and Android read AccessibilityInfo; web reads the
 * `prefers-reduced-motion` media query directly, as react-native-web's AccessibilityInfo keys
 * its listeners by the handler's source text, so two subscribers would clash.
 */
export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (Platform.OS === "web") {
    const media = window.matchMedia(QUERY);
    const listener = (e: MediaQueryListEvent) => onChange(e.matches);
    onChange(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }

  // The first answer is stale once a change event has come, or after the unsubscribe.
  let stale = false;
  const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (reduced) => {
    stale = true;
    onChange(reduced);
  });
  AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
    if (!stale) onChange(reduced);
  });
  return () => {
    stale = true;
    subscription.remove();
  };
}

/**
 * Whether the user asked the system to reduce motion. Animations should then switch states
 * directly. False until the setting is read: on the first render, and in the static web HTML.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => subscribeReducedMotion(setReduced), []);
  return reduced;
}
