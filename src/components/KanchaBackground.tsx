import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { KanchaColors } from "@/constants/colors";

interface KanchaBackgroundProps {
  children: ReactNode;
}

export function KanchaBackground({ children }: KanchaBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[KanchaColors.red, KanchaColors.redDark]}
        style={styles.topGlow}
      />
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KanchaColors.cream,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 230,
  },
  circleOne: {
    position: "absolute",
    top: 70,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  circleTwo: {
    position: "absolute",
    top: 120,
    left: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
