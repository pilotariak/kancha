import { Stack } from "expo-router";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { tournaments, upcomingMatches } from "@/mocks/kancha-data";

export default function TournamentDetailsScreen() {
  const tournament = tournaments[0];

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="tournament-details-screen"
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>{tournament.category}</Text>
            <Text style={styles.heroTitle}>{tournament.name}</Text>
            <View style={styles.metaWrap}>
              <View style={styles.metaItem}>
                <MapPin color={KanchaColors.white} size={14} />
                <Text style={styles.metaText}>{tournament.city}</Text>
              </View>
              <View style={styles.metaItem}>
                <CalendarDays color={KanchaColors.white} size={14} />
                <Text style={styles.metaText}>{tournament.dates}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users color={KanchaColors.white} size={14} />
                <Text style={styles.metaText}>{tournament.teams} teams</Text>
              </View>
            </View>
          </View>

          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Bracket — 1/4 final</Text>
              <StatusPill label="In progress" tone="red" />
            </View>
            <View style={styles.scoreBoard}>
              <View style={styles.playerRow}>
                <View style={styles.dotRed} />
                <Text style={styles.playerName}>
                  {tournament.featuredMatch.split(" vs ")[0]}
                </Text>
                <Text style={styles.scoreValue}>40</Text>
              </View>
              <View style={styles.playerRow}>
                <View style={styles.dotSoft} />
                <Text style={styles.playerNameMuted}>
                  {tournament.featuredMatch.split(" vs ")[1]}
                </Text>
                <Text style={styles.scoreValueMuted}>27</Text>
              </View>
            </View>
          </View>

          <SectionHeader
            eyebrow="Standings"
            title="Pool A ranking"
            subtitle="Automatic standings preview for the current group stage."
          />
          <View style={styles.tableCard}>
            {tournament.standings.map((row) => (
              <View
                key={row.id}
                style={styles.tableRow}
                testID={`standing-${row.id}`}
              >
                <Text
                  style={[
                    styles.rank,
                    row.rank === 1 ? styles.rankLeader : null,
                  ]}
                >
                  {row.rank}
                </Text>
                <Text style={styles.tablePlayer}>{row.player}</Text>
                <Text style={styles.tableRecord}>{row.record}</Text>
                <Text style={styles.tablePoints}>{row.points}</Text>
              </View>
            ))}
          </View>

          <SectionHeader
            eyebrow="Match queue"
            title="Next scheduled games"
            subtitle="Upcoming pairings connected to this competition."
          />
          <View style={styles.matchesList}>
            {upcomingMatches.map((match) => (
              <View
                key={match.id}
                style={styles.matchCard}
                testID={`details-match-${match.id}`}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchStage}>{match.stage}</Text>
                  <StatusPill
                    label={match.status === "live" ? "Live" : "Scheduled"}
                    tone={match.status === "live" ? "green" : "soft"}
                  />
                </View>
                <Text style={styles.matchTeams}>{match.teamA}</Text>
                <Text style={styles.matchTeamsMuted}>{match.teamB}</Text>
                <Text style={styles.matchMeta}>
                  {match.venue} · {match.datetime}
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
  heroCard: {
    borderRadius: 28,
    backgroundColor: KanchaColors.red,
    padding: 22,
    gap: 12,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroTitle: { color: KanchaColors.white, fontSize: 30, fontWeight: "900" },
  metaWrap: { gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: KanchaColors.white, fontSize: 14, fontWeight: "600" },
  panelCard: {
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    padding: 18,
    gap: 14,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  panelTitle: {
    flex: 1,
    color: KanchaColors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  scoreBoard: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    padding: 16,
    gap: 16,
  },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KanchaColors.red,
  },
  dotSoft: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DDD6CE" },
  playerName: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  playerNameMuted: {
    flex: 1,
    color: "#6A625B",
    fontSize: 18,
    fontWeight: "600",
  },
  scoreValue: { color: KanchaColors.red, fontSize: 34, fontWeight: "900" },
  scoreValueMuted: { color: "#81746A", fontSize: 34, fontWeight: "800" },
  tableCard: {
    borderRadius: 20,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE6DE",
    gap: 10,
  },
  rank: { width: 20, color: "#8D8278", fontSize: 15, fontWeight: "700" },
  rankLeader: { color: KanchaColors.red },
  tablePlayer: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  tableRecord: { color: "#7A6F65", fontSize: 14 },
  tablePoints: { color: KanchaColors.ink, fontSize: 15, fontWeight: "800" },
  matchesList: { gap: 12 },
  matchCard: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  matchStage: {
    flex: 1,
    color: KanchaColors.redDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  matchTeams: { color: KanchaColors.ink, fontSize: 17, fontWeight: "800" },
  matchTeamsMuted: { color: "#5E564F", fontSize: 15, fontWeight: "600" },
  matchMeta: { color: KanchaColors.muted, fontSize: 13 },
});
