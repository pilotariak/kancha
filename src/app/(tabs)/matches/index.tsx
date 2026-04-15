import { Clock3, MapPin, Radio, Swords } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { recentResults, upcomingMatches } from "@/mocks/kancha-data";

export default function MatchesScreen() {
  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="matches-screen"
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Schedule board</Text>
            <Text style={styles.title}>Matches</Text>
            <Text style={styles.subtitle}>
              Live-ready fixtures, venue planning, and completed scorelines.
            </Text>
          </View>

          <View style={styles.liveStrip}>
            <Radio color={KanchaColors.white} size={16} />
            <Text style={styles.liveStripText}>
              1 live match · 3 court updates pending
            </Text>
          </View>

          <SectionHeader
            eyebrow="Upcoming"
            title="Today and next"
            subtitle="Everything your staff needs for the next sessions."
          />
          <View style={styles.list}>
            {upcomingMatches.map((match) => (
              <PressableScale
                key={match.id}
                style={styles.card}
                testID={`matches-upcoming-${match.id}`}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{match.teamA}</Text>
                  <StatusPill
                    label={match.status === "live"
                      ? "Live"
                      : match.status === "tomorrow"
                      ? "Tomorrow"
                      : "Scheduled"}
                    tone={match.status === "live" ? "green" : "red"}
                  />
                </View>
                <Text style={styles.cardSubtitle}>{match.teamB}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock3 color={KanchaColors.muted} size={14} />
                    <Text style={styles.metaText}>{match.datetime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin color={KanchaColors.muted} size={14} />
                    <Text style={styles.metaText}>{match.venue}</Text>
                  </View>
                </View>
                {typeof match.scoreA === "number"
                    && typeof match.scoreB === "number"
                  ? (
                    <View style={styles.scoreBadge}>
                      <Swords color={KanchaColors.red} size={14} />
                      <Text style={styles.scoreBadgeText}>
                        {match.scoreA} — {match.scoreB}
                      </Text>
                    </View>
                  )
                  : null}
              </PressableScale>
            ))}
          </View>

          <SectionHeader
            eyebrow="Completed"
            title="Recent finals"
            subtitle="Closed results with score summaries."
          />
          <View style={styles.list}>
            {recentResults.map((match) => (
              <View
                key={match.id}
                style={styles.resultCard}
                testID={`matches-result-${match.id}`}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.resultMain}>
                    <Text style={styles.resultScore}>
                      {match.scoreA} — {match.scoreB}
                    </Text>
                    <Text style={styles.resultPlayers}>
                      {match.teamA} vs {match.teamB}
                    </Text>
                  </View>
                  <StatusPill label="Final" tone="dark" />
                </View>
                <Text style={styles.metaText}>
                  {match.stage} · {match.venue}
                </Text>
              </View>
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
  hero: { gap: 6 },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: KanchaColors.white, fontSize: 34, fontWeight: "900" },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 260,
  },
  liveStrip: {
    borderRadius: 16,
    backgroundColor: "#171717",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  liveStripText: { color: KanchaColors.white, fontSize: 14, fontWeight: "700" },
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
  cardTitle: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  cardSubtitle: { color: "#625A52", fontSize: 15, fontWeight: "600" },
  metaRow: { gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: KanchaColors.muted, fontSize: 13 },
  scoreBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: KanchaColors.redSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreBadgeText: {
    color: KanchaColors.redDark,
    fontSize: 13,
    fontWeight: "800",
  },
  resultCard: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  resultMain: { gap: 4 },
  resultScore: { color: KanchaColors.red, fontSize: 28, fontWeight: "900" },
  resultPlayers: { color: KanchaColors.ink, fontSize: 15, fontWeight: "700" },
});
