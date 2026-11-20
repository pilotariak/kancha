/**
 * Web layout sizes, from the window width:
 * - "phone" below 600px: the mobile layout, as on iOS and Android.
 * - "tablet" from 600px: one centered column, tabs at the bottom.
 * - "desktop" from 1024px: a navigation rail on the left, wider content.
 */
export type LayoutSize = "phone" | "tablet" | "desktop";

export const TABLET_MIN_WIDTH = 600;
export const DESKTOP_MIN_WIDTH = 1024;

/** The widest a screen's content column gets, gutters included. */
export const CONTENT_MAX_WIDTH: Record<Exclude<LayoutSize, "phone">, number> = {
  tablet: 720,
  desktop: 1120,
};

/** The width of the desktop navigation rail. */
export const RAIL_WIDTH = 128;

export function layoutSizeFor(width: number): LayoutSize {
  if (width >= DESKTOP_MIN_WIDTH) return "desktop";
  if (width >= TABLET_MIN_WIDTH) return "tablet";
  return "phone";
}
