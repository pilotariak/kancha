/**
 * Kancha design tokens — matches the landing page palette exactly.
 *
 * Source: landing/index.html CSS custom properties.
 */
export const Colors = {
  /** Primary dark background */
  ink: "#0b0e0f",
  /** Slightly lifted surface (cards, headers) */
  surface: "#111416",
  /** Warm cream — primary text / light background */
  paper: "#f4ede0",
  /** Forest green — primary brand color */
  verde: "#1a6640",
  /** Bright green — hover / active state */
  verdeBright: "#22844f",
  /** Green tint — chip / badge backgrounds */
  verdeGlow: "rgba(26, 102, 64, 0.15)",
  /** Red — phase labels, destructive, live indicator */
  rojo: "#c82020",
  /** Amber / gold — scores */
  oro: "#c9a227",
  /** Muted gray-green — secondary labels */
  muted: "#707878",

  // Semantic text shades on ink background
  textPrimary: "#f4ede0",
  textSecondary: "rgba(244, 237, 224, 0.65)",
  textMuted: "rgba(244, 237, 224, 0.35)",

  // Card / surface
  cardBackground: "rgba(244, 237, 224, 0.04)",
  cardBorder: "rgba(244, 237, 224, 0.08)",

  // Filter bar / header strip
  filterBackground: "#0e1214",
  filterBorder: "rgba(244, 237, 224, 0.06)",

  // Chip states
  chipActive: "#1a6640",
  chipActiveText: "#ffffff",
  chipInactive: "rgba(244, 237, 224, 0.06)",
  chipInactiveText: "rgba(244, 237, 224, 0.6)",

  // Input
  inputBackground: "rgba(244, 237, 224, 0.06)",
  inputText: "#f4ede0",
  inputPlaceholder: "rgba(244, 237, 224, 0.3)",

  // Score / match card
  scoreBg: "rgba(201, 162, 39, 0.12)",
  scoreBorder: "rgba(201, 162, 39, 0.25)",
  /** Winner team highlight */
  winnerText: "#f4ede0",
  winnerDot: "#22844f",
  /** Phase pill */
  phaseBg: "rgba(200, 32, 32, 0.15)",
  phaseBorder: "rgba(200, 32, 32, 0.3)",

  // Card left accent bar
  accentBar: "#1a6640",
  divider: "rgba(244, 237, 224, 0.06)",
} as const;

export const Typography = {
  /** Palatino serif — used for titles/headings on the landing page */
  serif: "Georgia, 'Book Antiqua', serif" as const,
  /** Monospace — used for scores on the landing page */
  mono: "'Courier New', Courier, monospace" as const,
} as const;
