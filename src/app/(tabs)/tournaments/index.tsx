import { router } from "expo-router";
import { ChevronRight, Plus, Sparkles } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { tournaments } from "@/mocks/kancha-data";

export default function TournamentsScreen() {
  const featured = tournaments[0];
  const others = tournaments.slice(1);

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
              <Text style={styles.eyebrow}>Competition desk</Text>
              <Text style={styles.title}>Tournaments</Text>
              <Text style={styles.subtitle}>
                Plan formats, manage player pools, and monitor standings.
              </Text>
            </View>
            <PressableScale
              style={styles.createButtonWrap}
              onPress={() => router.push("/(tabs)/tournaments/new")}
              testID="tournaments-new-button"
            >
              <View style={styles.createButton}>
                <Plus color={KanchaColors.white} size={18} />
              </View>
            </PressableScale>
          </View>

          <PressableScale
            style={styles.featuredCard}
            onPress={() => router.push("/(tabs)/tournaments/details")}
            testID="tournament-featured-card"
          >
            <View style={styles.featuredTop}>
              <View>
                <Text style={styles.featuredEyebrow}>Featured</Text>
                <Text style={styles.featuredTitle}>{featured.name}</Text>
              </View>
              <StatusPill label="In progress" tone="red" />
            </View>
            <Text style={styles.featuredMeta}>
              {featured.city} · {featured.dates}
            </Text>
            <View style={styles.featuredPanel}>
              <Sparkles color={KanchaColors.white} size={16} />
              <Text style={styles.featuredPanelText}>
                {featured.roundsLabel} · {featured.teams} teams · {featured.discipline}
              </Text>
            </View>
            <View style={styles.featuredFooter}>
              <Text style={styles.featuredFooterText}>
                {featured.featuredMatch}
              </Text>
              <ChevronRight color={KanchaColors.white} size={16} />
            </View>
          </PressableScale>

          <SectionHeader
            eyebrow="All competitions"
            title="Season overview"
            subtitle="Ongoing, upcoming, and completed cups for your club."
          />
          <View style={styles.list}>
            {others.map((item) => (
              <PressableScale
                key={item.id}
                style={styles.card}
                onPress={() => router.push("/(tabs)/tournaments/details")}
                testID={`tournament-card-${item.id}`}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.flexOne}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {item.city} · {item.dates}
                    </Text>
                  </View>
                  <StatusPill
                    label={item.status === "completed"
                      ? "Completed"
                      : item.status === "upcoming"
                      ? "Upcoming"
                      : "Ongoing"}
                    tone={item.status === "completed"
                      ? "soft"
                      : item.status === "upcoming"
                      ? "green"
                      : "red"}
                  />
                </View>
                <Text style={styles.cardInfo}>
                  {item.category} · {item.discipline} · {item.teams} teams
                </Text>
                <Text style={styles.cardHighlight}>{item.featuredMatch}</Text>
              </PressableScale>
            ))}
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
  featuredCard: {
    borderRadius: 24,
    backgroundColor: KanchaColors.red,
    padding: 20,
    gap: 12,
  },
  featuredTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  featuredEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  featuredTitle: {
    color: KanchaColors.white,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 6,
  },
  featuredMeta: { color: "rgba(255,255,255,0.82)", fontSize: 14 },
  featuredPanel: {
    borderRadius: 16,
    backgroundColor: "#161616",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredPanelText: {
    color: KanchaColors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  featuredFooterText: {
    flex: 1,
    color: KanchaColors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  list: { gap: 12 },
  card: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  flexOne: { flex: 1 },
  cardTitle: { color: KanchaColors.ink, fontSize: 18, fontWeight: "800" },
  cardMeta: { color: KanchaColors.muted, fontSize: 13, marginTop: 4 },
  cardInfo: { color: "#685F57", fontSize: 14, fontWeight: "600" },
  cardHighlight: {
    color: KanchaColors.redDark,
    fontSize: 14,
    fontWeight: "700",
  },
});
