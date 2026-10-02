import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

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
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      gap: 4,
    },
    eyebrow: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    title: {
      color: c.ink,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.8,
    },
    subtitle: {
      color: c.muted,
      fontSize: 14,
      lineHeight: 20,
    },
  });
