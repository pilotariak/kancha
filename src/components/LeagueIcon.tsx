import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import type { League } from "@/constants/leagues";
import { useThemedStyles } from "@/hooks/use-theme";

interface LeagueIconProps {
  league: League;
  /** On the red header band: a white ring, as the redFill tile has no edge there. */
  onBand?: boolean;
}

/**
 * The league's tile: its code in white on redFill, muted for a league Kancha does not cover
 * yet. Hidden from assistive technology: the name next to it says which league it is.
 */
export function LeagueIcon({ league, onBand = false }: LeagueIconProps) {
  const styles = useThemedStyles(makeStyles);

  // An official league logo, once a committee provides one, replaces this tile at the same size.
  return (
    <View
      aria-hidden
      style={[styles.tile, !league.supported && styles.tileMuted, onBand && styles.tileOnBand]}
    >
      {/* Capped so that "IDF" stays inside the tile at large text sizes. */}
      <Text
        style={[styles.code, !league.supported && styles.codeMuted]}
        maxFontSizeMultiplier={1.3}
      >
        {league.code}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tile: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.redFill,
      alignItems: "center",
      justifyContent: "center",
    },
    tileMuted: { backgroundColor: c.line },
    tileOnBand: { borderWidth: 2, borderColor: "#FFFFFF" },
    // The literal white, as ScreenHeader: the white token is dark green in the dark theme.
    code: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
    // Not muted: muted on line is 3.2:1 in the light theme.
    codeMuted: { color: c.text },
  });
