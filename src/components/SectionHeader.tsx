import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { KanchaColors } from "@/constants/colors";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  eyebrow: {
    color: KanchaColors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: KanchaColors.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: KanchaColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
