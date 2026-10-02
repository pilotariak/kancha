import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useTheme } from "@/hooks/use-theme";

type Tone = "red" | "green" | "dark" | "soft" | "amber";

interface StatusPillProps {
  label: string;
  tone: Tone;
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

export function StatusPill({ label, tone }: StatusPillProps) {
  const { colors } = useTheme();
  const palette = toneFor(tone, colors);

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
