import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { KanchaColors } from "@/constants/colors";

interface LaunchScreenProps {
  onFinish: () => void;
}

export function LaunchScreen({ onFinish }: LaunchScreenProps) {
  const iconScale = useRef(new Animated.Value(0.72)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const version = Constants.expoConfig?.version ?? "—";

  useEffect(() => {
    Animated.sequence([
      // Icon springs in while fading — spring gives natural overshoot feel
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      // Title then subtitle stagger in
      Animated.stagger(110, [
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(950),
      // All fade out together
      Animated.parallel([
        Animated.timing(iconOpacity, { toValue: 0, duration: 360, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 360, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 0, duration: 360, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <LinearGradient
      colors={[KanchaColors.red, KanchaColors.redDark]}
      style={StyleSheet.absoluteFill}
    >
      {/* Decorative translucent circles — consistent with hero zone across all screens */}
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View
            style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 112, height: 112 }}
            />
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            Kancha
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Pilotariak
          </Animated.Text>
        </View>

        <Animated.Text
          style={[styles.version, { opacity: subtitleOpacity }]}
        >
          v{version}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circleOne: {
    position: "absolute",
    top: 60,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  circleTwo: {
    position: "absolute",
    top: 200,
    left: -45,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
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
    fontWeight: "900",
    letterSpacing: 2,
    color: KanchaColors.white,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 6,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
  },
  version: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
});
