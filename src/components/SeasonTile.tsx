import type { Href } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { CardLink } from "@/components/CardLink";
import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

interface SeasonTileProps {
  title: string;
  eyebrow?: string;
  /** "season": a large season ("2025-2026"). "name": a competition label, under a season heading. */
  variant: "season" | "name";
  /** The screen the tile opens: a path, for the iOS preview and its Share and Copy link. */
  href: Extract<Href, string>;
  /** The full competition name, season included. */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * A tile of the season grid. It fills its cell: place two cells per row, each a View with
 * `flex: 1` and no padding, so an odd last tile keeps its half width next to an empty cell.
 */
export function SeasonTile({
  title,
  eyebrow,
  variant,
  href,
  accessibilityLabel,
  testID,
}: SeasonTileProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <CardLink
      style={[styles.tile, variant === "season" && styles.tileSeason]}
      href={href}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {eyebrow ? <Text style={styles.eyebrow} numberOfLines={3}>{eyebrow}</Text> : null}
      <Text
        style={variant === "season" ? styles.season : styles.name}
        numberOfLines={variant === "season" ? 1 : 3}
      >
        {title}
      </Text>
    </CardLink>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      justifyContent: "space-between",
      gap: 8,
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.line,
    },
    // 12px sides too: at 375px, a 16px padding leaves 128px for the 129px of "2025-2026".
    tileSeason: { padding: 12 },
    // Text, not muted: the eyebrow names the competition, and muted on card is 4.2:1.
    eyebrow: {
      color: c.text,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    // At the bottom: beside a tile that shows a name, the years of a row stay level.
    season: {
      marginTop: "auto",
      color: c.ink,
      fontSize: 22,
      fontWeight: "900",
      fontVariant: ["tabular-nums"],
    },
    name: { color: c.ink, fontSize: 16, fontWeight: "800", lineHeight: 20 },
  });
