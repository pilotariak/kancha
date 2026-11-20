/**
 * The web layout, derived from the phone card rather than from device sizes. A phone shows one
 * column of cards between 20px gutters. A wider window adds a column each time one more card
 * fits, and shows the navigation rail once the content beside it still holds two columns.
 * iOS and Android always use the phone layout.
 */

/** The phone card: a 390px screen less its two gutters. */
export const CARD_WIDTH = 350;
export const GUTTER = 20;
export const GRID_GAP = 12;
export const RAIL_WIDTH = 128;

/** The content width, gutters included, that holds `columns` cards side by side. */
export function gridWidth(columns: number): number {
  return columns * CARD_WIDTH + (columns - 1) * GRID_GAP + 2 * GUTTER;
}

/** How many cards fit side by side in a content width, gutters included: one at least. */
export function columnsFor(contentWidth: number): number {
  return Math.max(
    1,
    Math.floor((contentWidth - 2 * GUTTER + GRID_GAP) / (CARD_WIDTH + GRID_GAP)),
  );
}

/** The rail replaces the bottom tabs from this window width: two columns still fit beside it. */
export const RAIL_MIN_WIDTH = gridWidth(2) + RAIL_WIDTH;

/** Text and forms keep to the width of two cards, gutters included. */
export const TEXT_MAX_WIDTH = gridWidth(2);

export interface WebLayout {
  /** Cards side by side; 1 is the phone layout. */
  columns: number;
  /** The navigation rail on the left, instead of the bottom tabs. */
  rail: boolean;
  /** The width beside the rail, gutters included. */
  contentWidth: number;
  /** The width of one grid cell: a card, or the filter column of the results. */
  cellWidth: number;
}

/** The phone layout at any width: one column, no rail. */
export function phoneLayoutFor(windowWidth: number): WebLayout {
  return {
    columns: 1,
    rail: false,
    contentWidth: windowWidth,
    cellWidth: windowWidth - 2 * GUTTER,
  };
}

export function webLayoutFor(windowWidth: number): WebLayout {
  const rail = windowWidth >= RAIL_MIN_WIDTH;
  const contentWidth = rail ? windowWidth - RAIL_WIDTH : windowWidth;
  const columns = columnsFor(contentWidth);
  const cellWidth = (contentWidth - 2 * GUTTER - (columns - 1) * GRID_GAP) / columns;
  return { columns, rail, contentWidth, cellWidth };
}
