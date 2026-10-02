import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface KanchaBackgroundProps {
  children: ReactNode;
}

export function KanchaBackground({ children }: KanchaBackgroundProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.red, colors.redDark, colors.cream]}
        locations={[0, 0.55, 1]}
        style={styles.topGlow}
      />
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />
      {children}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.cream,
    },
    topGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 300,
    },
    circleOne: {
      position: "absolute",
      top: 70,
      right: -20,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: c.heroCircleOne,
    },
    circleTwo: {
      position: "absolute",
      top: 120,
      left: -35,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: c.heroCircleTwo,
    },
  });
