import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

/**
 * No Android icon on iOS: the tabs use SF Symbols there. Metro resolves
 * `android-tab-icon.android.tsx` on Android; this file keeps its icon font out of the iOS bundle.
 */
export function androidTabIcon(
  _name: ComponentProps<typeof MaterialCommunityIcons>["name"],
): undefined {
  return undefined;
}
