import { router } from "expo-router";
import { ChevronRight, Trophy } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { KanchaColors } from "@/constants/colors";
import { useCompetitions } from "@/hooks/use-competitions";

export default function CompetitionsScreen() {
  const { data: competitions, isPending, isError, error } = useCompetitions();

  const featured = competitions?.[0];
  const others = competitions?.slice(1) ?? [];

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="competitions-screen"
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Competition desk</Text>
            <Text style={styles.title}>Competitions</Text>
            <Text style={styles.subtitle}>
              Plan formats, manage player pools, and monitor standings.
            </Text>
          </View>

          {isPending && (
            <View style={styles.centered}>
              <ActivityIndicator color={KanchaColors.white} size="large" />
            </View>
          )}

          {isError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : "Failed to load competitions"}
              </Text>
            </View>
          )}

          {featured && (
            <PressableScale
              style={styles.featuredCard}
              onPress={() => router.push(`/(tabs)/competitions/details?id=${featured.id}`)}
              testID="competition-featured-card"
            >
              <View style={styles.featuredTop}>
                <View>
                  <Text style={styles.featuredEyebrow}>Featured</Text>
                  <Text style={styles.featuredTitle}>{featured.name}</Text>
                </View>
              </View>
              {(featured.year != null || featured.level) && (
                <View style={styles.featuredPanel}>
                  <Trophy color={KanchaColors.white} size={16} />
                  <Text style={styles.featuredPanelText}>
                    {[featured.year, featured.level].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              )}
              <View style={styles.featuredFooter}>
                <Text style={styles.featuredFooterText}>View details</Text>
                <ChevronRight color={KanchaColors.white} size={16} />
              </View>
            </PressableScale>
          )}

          {others.length > 0 && (
            <>
              <SectionHeader
                eyebrow="All competitions"
                title="Season overview"
                subtitle="All competitions for your league."
              />
              <View style={styles.list}>
                {others.map((item) => (
                  <PressableScale
                    key={item.id}
                    style={styles.card}
                    onPress={() => router.push(`/(tabs)/competitions/details?id=${item.id}`)}
                    testID={`competition-card-${item.id}`}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      {item.level && <Text style={styles.cardLevel}>{item.level}</Text>}
                    </View>
                    {item.year != null && <Text style={styles.cardMeta}>{item.year}</Text>}
                  </PressableScale>
                ))}
              </View>
            </>
          )}
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
  hero: { gap: 6 },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: KanchaColors.white, fontSize: 34, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 20 },
  centered: {
    paddingVertical: 60,
    alignItems: "center",
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: "rgba(255,60,60,0.15)",
    padding: 16,
  },
  errorText: {
    color: KanchaColors.white,
    fontSize: 14,
    fontWeight: "600",
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
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { color: KanchaColors.ink, fontSize: 18, fontWeight: "800", flex: 1 },
  cardLevel: { color: KanchaColors.muted, fontSize: 13, fontWeight: "600" },
  cardMeta: { color: KanchaColors.muted, fontSize: 13 },
});
