import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useTheme } from "@/hooks/use-theme";

type Tone = "red" | "green" | "dark" | "soft" | "amber";

interface StatusPillProps {
  label: string;
  tone: Tone;
  /** "small" fits a line of text, as in the ranking rows. */
  size?: "regular" | "small";
}

function toneFor(tone: Tone, c: Palette): { backgroundColor: string; color: string } {
  switch (tone) {
    case "red":
      return { backgroundColor: c.redSoft, color: c.red };
    case "green":
      return { backgroundColor: c.greenSoft, color: c.green };
    case "dark":
      return { backgroundColor: c.text, color: c.cream };
    case "soft":
      return { backgroundColor: c.line, color: c.muted };
    case "amber":
      return { backgroundColor: c.amberBg, color: c.amber };
  }
}

export function StatusPill({ label, tone, size = "regular" }: StatusPillProps) {
  const { colors } = useTheme();
  const palette = toneFor(tone, colors);
  const small = size === "small";

  return (
    <View
      style={[styles.pill, small && styles.pillSmall, { backgroundColor: palette.backgroundColor }]}
    >
      <Text
        style={[styles.label, small && styles.labelSmall, { color: palette.color }]}
        numberOfLines={small ? 1 : undefined}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillSmall: { paddingHorizontal: 7, paddingVertical: 2 },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  labelSmall: { fontSize: 11, lineHeight: 14 },
});
