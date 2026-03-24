import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { KanchaColors } from "@/constants/colors";

function KanchaLogo({ size = 96 }: { size?: number }) {
  const r = size / 2;
  const strokeW = size * 0.045;

  // Pelota (Basque ball) — white circle with curved stitch lines
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={KanchaColors.white} />
      <Circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="rgba(200,16,46,0.18)"
        strokeWidth="2"
      />
      {/* stitch arcs that suggest a pelota ball */}
      <Path
        d="M 28 20 Q 50 42 28 64"
        fill="none"
        stroke={KanchaColors.red}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <Path
        d="M 72 20 Q 50 42 72 64"
        fill="none"
        stroke={KanchaColors.red}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {/* K letter centred */}
      <Path
        d="M 38 30 L 38 70 M 38 50 L 58 30 M 38 50 L 60 70"
        fill="none"
        stroke={KanchaColors.red}
        strokeWidth={strokeW * 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface LaunchScreenProps {
  onFinish: () => void;
}

export function LaunchScreen({ onFinish }: LaunchScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const version = Constants.expoConfig?.version ?? "—";

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [opacity, onFinish]);

  return (
    <LinearGradient
      colors={[KanchaColors.red, KanchaColors.redDark]}
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity }]}>
          <KanchaLogo size={112} />
          <Text style={styles.title}>Kancha</Text>
          <Text style={styles.subtitle}>Pilotariak</Text>
        </Animated.View>

        <Animated.Text style={[styles.version, { opacity }]}>
          v{version}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: KanchaColors.white,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 6,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
  },
  version: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1,
  },
});
