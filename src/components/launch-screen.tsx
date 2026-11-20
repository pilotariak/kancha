import Constants from "expo-constants";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

interface LaunchScreenProps {
  onFinish: () => void;
}

/**
 * The start-up animation, on the solid redFill of the screen header band. The
 * native splash (app.config.js) has the same redFill, light and dark, so the
 * step from one to the other does not show.
 */
export function LaunchScreen({ onFinish }: LaunchScreenProps) {
  const styles = useThemedStyles(makeStyles);
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
    <View style={styles.screen}>
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

      <Animated.Text style={[styles.version, { opacity: subtitleOpacity }]}>
        v{version}
      </Animated.Text>
    </View>
  );
}

// Text on redFill uses the band's colors (DESIGN.md, Screen Header): white,
// or onRedSoft, which keeps 4.5:1 on redFill in both themes.
const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.redFill,
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
      color: "#FFFFFF",
    },
    subtitle: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 6,
      color: c.onRedSoft,
      textTransform: "uppercase",
    },
    version: {
      position: "absolute",
      bottom: 48,
      fontSize: 12,
      color: c.onRedSoft,
      letterSpacing: 1,
    },
  });
