import { Stack } from "expo-router";
import React from "react";

/**
 * The slot links: the invite link (`join`), the personal link (`me`) and the recovery link
 * (`recover`). Out of the tabs, so that a link opens them while the Créneaux tab is hidden; the
 * slot list and its screens stay in `(tabs)/slot`.
 */
export default function SlotLinksLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
