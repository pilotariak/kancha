import Constants from "expo-constants";
import { ExternalLink } from "lucide-react-native";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { KanchaColors } from "@/constants/colors";

const WEBSITE_URL = "https://pilotariak.com";
const APP_VERSION = Constants.expoConfig?.version ?? "—";
const COPYRIGHT_YEAR = new Date().getFullYear();

export default function AboutScreen() {
  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>K</Text>
            </View>
            <Text style={styles.appName}>Kancha</Text>
            <Text style={styles.tagline}>Pelota tournament manager</Text>
          </View>

          <View style={styles.cards}>
            <View style={styles.card} testID="about-version">
              <Text style={styles.cardLabel}>Version</Text>
              <Text style={styles.cardValue}>{APP_VERSION}</Text>
            </View>

            <View style={styles.card} testID="about-copyright">
              <Text style={styles.cardLabel}>Copyright</Text>
              <Text style={styles.cardValue}>© {COPYRIGHT_YEAR} Pilotariak</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => void Linking.openURL(WEBSITE_URL)}
              testID="about-website"
            >
              <Text style={styles.cardLabel}>Website</Text>
              <View style={styles.linkRow}>
                <Text style={styles.linkText}>pilotariak.com</Text>
                <ExternalLink color={KanchaColors.red} size={14} />
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 32,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: KanchaColors.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: KanchaColors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  logoLetter: {
    color: KanchaColors.white,
    fontSize: 42,
    fontWeight: "900",
  },
  appName: {
    color: KanchaColors.ink,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  tagline: {
    color: KanchaColors.muted,
    fontSize: 14,
  },
  cards: {
    gap: 10,
  },
  card: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardPressed: {
    backgroundColor: KanchaColors.cream,
  },
  cardLabel: {
    color: KanchaColors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  cardValue: {
    color: KanchaColors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    color: KanchaColors.red,
    fontSize: 15,
    fontWeight: "700",
  },
});
