import React from "react";
import { StyleSheet, View } from "react-native";

import { Shield } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface LeagueIconProps {
  /** A league Kancha does not cover yet gets a muted tile. */
  supported: boolean;
}

/** The tile in front of a league name, on the Leagues and About screens. */
export function LeagueIcon({ supported }: LeagueIconProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.tile, !supported && styles.tileDisabled]}>
      <Shield color={supported ? colors.red : colors.muted} size={18} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tile: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.redSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    tileDisabled: {
      backgroundColor: c.line,
    },
  });
