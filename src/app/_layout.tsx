import { Colors } from "@/constants/theme";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onlineManager } from "@tanstack/react-query";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

// Keep the native splash screen visible until we're ready to animate it away.
SplashScreen.preventAutoHideAsync();

// Sync React Query's online state with the device network status.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true);
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  // Opacity for the entire in-app splash overlay
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  // Scale for the logo (subtle grow-in effect)
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Hide native splash → our in-app overlay takes over seamlessly
    SplashScreen.hideAsync();

    // 2. Logo appear animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. After a short hold, fade the overlay out
    const timer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setSplashDone(true));
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NativeTabs>
        <NativeTabs.Trigger name="(tournaments)">
          <NativeTabs.Trigger.Icon sf="trophy" md="emoji_events" />
          <NativeTabs.Trigger.Label>Tournaments</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* In-app splash overlay — sits on top until animation finishes */}
      {!splashDone && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents="none"
        >
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* App icon */}
            <View style={styles.iconRing}>
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

            {/* App name */}
            <View style={{ alignItems: "center", gap: 6 }}>
              <Animated.Text style={styles.appName}>
                KANCHA
              </Animated.Text>
              <Animated.Text style={styles.tagline}>
                Basque Pelota Tournaments
              </Animated.Text>
            </View>
          </Animated.View>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomDot} />
            <View style={[styles.bottomDot, { backgroundColor: Colors.verde }]} />
            <View style={styles.bottomDot} />
          </View>
        </Animated.View>
      )}
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: Colors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: Colors.verdeGlow,
    borderWidth: 1.5,
    borderColor: "rgba(26, 102, 64, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
    letterSpacing: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 52,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  bottomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cardBorder,
  },
});
