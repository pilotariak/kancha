import { useMemo, useSyncExternalStore } from "react";
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";

import {
  phoneLayoutFor,
  TEXT_MAX_WIDTH,
  type WebLayout,
  webLayoutFor,
} from "@/features/layout/breakpoints";

const subscribeNever = () => () => {};

function useWebLayoutOnWeb(): WebLayout {
  const { width } = useWindowDimensions();
  // The static HTML is rendered without a window, so it holds the phone layout. While React
  // hydrates it, the server snapshot (false) keeps the client on that layout too; React then
  // re-renders with the window's size.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  return useMemo(() => (hydrated ? webLayoutFor : phoneLayoutFor)(width), [hydrated, width]);
}

function usePhoneLayout(): WebLayout {
  const { width } = useWindowDimensions();
  return useMemo(() => phoneLayoutFor(width), [width]);
}

/**
 * The layout for the window width (see `webLayoutFor`): how many card columns, whether the rail
 * shows. iOS and Android always get the phone layout.
 */
export const useWebLayout: () => WebLayout = Platform.OS === "web"
  ? useWebLayoutOnWeb
  : usePhoneLayout;

const TEXT_COLUMN: ViewStyle = { width: "100%", maxWidth: TEXT_MAX_WIDTH, alignSelf: "center" };

/**
 * Caps a text or form screen at two cards' width and centers it, once the window holds two
 * columns. Add it to the view that holds the 20px gutter, and pass it to the ScreenHeader.
 */
export function useTextColumn(): ViewStyle | undefined {
  return useWebLayout().columns > 1 ? TEXT_COLUMN : undefined;
}
