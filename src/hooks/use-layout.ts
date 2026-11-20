import { useSyncExternalStore } from "react";
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";

import {
  CONTENT_MAX_WIDTH,
  type LayoutSize,
  layoutSizeFor,
  RAIL_WIDTH,
} from "@/features/layout/breakpoints";

const subscribeNever = () => () => {};

function useWebLayoutSize(): LayoutSize {
  const { width } = useWindowDimensions();
  // The static HTML is rendered without a window, so it holds the phone layout. While React
  // hydrates it, the server snapshot (false) keeps the client on that layout too; React then
  // re-renders with the window's size.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  return hydrated ? layoutSizeFor(width) : "phone";
}

/**
 * The layout size from the window width (see `layoutSizeFor`). Web only: iOS and Android
 * always get "phone", without reading the window size.
 */
export const useLayoutSize: () => LayoutSize = Platform.OS === "web"
  ? useWebLayoutSize
  : () => "phone";

const COLUMNS: Record<Exclude<LayoutSize, "phone">, ViewStyle> = {
  tablet: { width: "100%", maxWidth: CONTENT_MAX_WIDTH.tablet, alignSelf: "center" },
  desktop: { width: "100%", maxWidth: CONTENT_MAX_WIDTH.desktop, alignSelf: "center" },
};

/**
 * Caps a screen's content column at the layout's maximum width and centers it. Add it to the
 * view that holds the 20px gutter, so the gutter sits inside the cap. Undefined on a phone.
 */
export function useContentColumn(): ViewStyle | undefined {
  const size = useLayoutSize();
  return size === "phone" ? undefined : COLUMNS[size];
}

/** The outer width of the content column: the window width on a phone. */
export function useContentWidth(): number {
  const size = useLayoutSize();
  const { width } = useWindowDimensions();
  if (size === "phone") return width;
  const available = size === "desktop" ? width - RAIL_WIDTH : width;
  return Math.min(available, CONTENT_MAX_WIDTH[size]);
}
