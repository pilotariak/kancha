import { router } from "expo-router";
import { Plus, Swords } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { KanchaColors } from "@/constants/colors";

export default function TournamentsScreen() {
  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="tournaments-screen"
        >
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Tournament desk</Text>
              <Text style={styles.title}>Tournaments</Text>
              <Text style={styles.subtitle}>
                Create and manage your tournaments.
              </Text>
            </View>
            <PressableScale
              style={styles.createButtonWrap}
              onPress={() => router.push("/(tabs)/competitions/new")}
              testID="tournaments-new-button"
            >
              <View style={styles.createButton}>
                <Plus color={KanchaColors.white} size={18} />
              </View>
            </PressableScale>
          </View>

          <View style={styles.emptyCard}>
            <Swords color={KanchaColors.muted} size={40} />
            <Text style={styles.emptyTitle}>No tournaments yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first tournament.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 22,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: KanchaColors.white, fontSize: 34, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 20 },
  createButtonWrap: { borderRadius: 18 },
  createButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 40,
    alignItems: "center",
    gap: 14,
  },
  emptyTitle: {
    color: KanchaColors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
