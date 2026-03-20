import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { KanchaColors } from "@/constants/colors";

interface StatusPillProps {
  label: string;
  tone: "red" | "green" | "dark" | "soft";
}

const toneStyles = {
  red: {
    backgroundColor: "#F9D8DE",
    color: KanchaColors.redDark,
  },
  green: {
    backgroundColor: KanchaColors.greenSoft,
    color: KanchaColors.green,
  },
  dark: {
    backgroundColor: "#262626",
    color: KanchaColors.white,
  },
  soft: {
    backgroundColor: "#EFE8DE",
    color: "#5D5145",
  },
} as const;

export function StatusPill({ label, tone }: StatusPillProps) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
