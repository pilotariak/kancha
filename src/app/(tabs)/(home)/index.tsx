import { router } from "expo-router";
import { Bell, ChevronRight, Shield, TimerReset, Trophy, WalletCards } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { dashboardMetrics, recentResults, tournaments, upcomingMatches } from "@/mocks/kancha-data";

export default function HomeScreen() {
  const heroOffset = useRef(new Animated.Value(18)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOffset, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOffset, heroOpacity]);

  const featuredTournament = useMemo(() => tournaments[0], []);

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="home-screen"
        >
          <Animated.View
            style={[
              styles.hero,
              { opacity: heroOpacity, transform: [{ translateY: heroOffset }] },
            ]}
          >
            <View style={styles.topRow}>
              <View style={styles.brandWrap}>
                <View style={styles.brandIcon}>
                  <WalletCards color={KanchaColors.white} size={20} />
                </View>
                <View>
                  <Text style={styles.brandTitle}>KANCHA</Text>
                  <Text style={styles.brandSubtitle}>
                    Pilotariak Team · Welcome back, Mikel
                  </Text>
                </View>
              </View>
              <PressableScale
                style={styles.alertButton}
                onPress={() => router.push("/modal")}
                testID="home-alerts-button"
              >
                <Bell color={KanchaColors.white} size={18} />
              </PressableScale>
            </View>

            <View style={styles.metricsCard}>
              {dashboardMetrics.map((metric, index) => (
                <View
                  key={metric.id}
                  style={[
                    styles.metricItem,
                    index < dashboardMetrics.length - 1
                      ? styles.metricDivider
                      : null,
                  ]}
                >
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={styles.body}>
            <SectionHeader
              eyebrow="Match day"
              title="Upcoming matches"
              subtitle="Track fixtures, venues, and live-ready pairings."
            />
            <View style={styles.cardList}>
              {upcomingMatches.map((match) => (
                <PressableScale
                  key={match.id}
                  style={styles.matchCard}
                  testID={`home-upcoming-${match.id}`}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.flexOne}>
                      <Text style={styles.matchTitle}>{match.teamA}</Text>
                      <Text style={styles.matchMeta}>
                        {match.venue} · {match.datetime}
                      </Text>
                    </View>
                    <StatusPill
                      label={match.status === "live"
                        ? "Live"
                        : match.status === "tomorrow"
                        ? "Tomorrow"
                        : "Scheduled"}
                      tone={match.status === "live" ? "green" : "red"}
                    />
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.secondaryTeam}>{match.teamB}</Text>
                  {typeof match.scoreA === "number"
                      && typeof match.scoreB === "number"
                    ? (
                      <View style={styles.scoreRow}>
                        <Text style={styles.liveScore}>{match.scoreA}</Text>
                        <Text style={styles.liveScoreSeparator}>—</Text>
                        <Text style={styles.liveScore}>{match.scoreB}</Text>
                      </View>
                    )
                    : null}
                </PressableScale>
              ))}
            </View>

            <PressableScale
              style={styles.featuredCard}
              onPress={() => router.push("/(tabs)/tournaments/details")}
              testID="home-featured-tournament"
            >
              <View style={styles.featuredHeader}>
                <View>
                  <Text style={styles.featuredEyebrow}>
                    Featured tournament
                  </Text>
                  <Text style={styles.featuredTitle}>
                    {featuredTournament.name}
                  </Text>
                  <Text style={styles.featuredMeta}>
                    {featuredTournament.city} · {featuredTournament.teams} teams
                  </Text>
                </View>
                <ChevronRight color={KanchaColors.white} size={18} />
              </View>
              <View style={styles.featuredPanel}>
                <View style={styles.featuredPanelHeader}>
                  <Text style={styles.featuredPanelTitle}>
                    Bracket — {featuredTournament.roundsLabel}
                  </Text>
                  <StatusPill label="Ongoing" tone="red" />
                </View>
                <Text style={styles.featuredMatch}>
                  {featuredTournament.featuredMatch}
                </Text>
                <Text style={styles.featuredScore}>
                  {featuredTournament.featuredScore}
                </Text>
              </View>
            </PressableScale>

            <SectionHeader
              eyebrow="Momentum"
              title="Recent results"
              subtitle="Last completed matches across your active competitions."
            />
            <View style={styles.cardList}>
              {recentResults.map((match) => (
                <View
                  key={match.id}
                  style={styles.resultCard}
                  testID={`home-result-${match.id}`}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.flexOne}>
                      <Text style={styles.resultTitle}>
                        {match.teamA} {match.scoreA} — {match.scoreB} {match.teamB}
                      </Text>
                      <Text style={styles.matchMeta}>{match.stage}</Text>
                    </View>
                    <StatusPill label="Win" tone="green" />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.quickRow}>
              <View style={styles.quickCard}>
                <Shield color={KanchaColors.red} size={18} />
                <Text style={styles.quickValue}>94%</Text>
                <Text style={styles.quickLabel}>Player attendance</Text>
              </View>
              <View style={styles.quickCard}>
                <Trophy color={KanchaColors.red} size={18} />
                <Text style={styles.quickValue}>6</Text>
                <Text style={styles.quickLabel}>Active cups</Text>
              </View>
              <View style={styles.quickCard}>
                <TimerReset color={KanchaColors.red} size={18} />
                <Text style={styles.quickValue}>3</Text>
                <Text style={styles.quickLabel}>Schedules today</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  brandTitle: {
    color: KanchaColors.white,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  brandSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "500",
  },
  alertButton: {
    borderRadius: 999,
  },
  metricsCard: {
    flexDirection: "row",
    borderRadius: 22,
    backgroundColor: "#B70F2A",
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: KanchaColors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  metricDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.18)",
  },
  metricValue: {
    color: KanchaColors.white,
    fontSize: 30,
    fontWeight: "900",
  },
  metricLabel: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    marginTop: 22,
    gap: 22,
    paddingHorizontal: 20,
  },
  cardList: {
    gap: 12,
  },
  matchCard: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  matchTitle: {
    color: KanchaColors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  matchMeta: {
    color: KanchaColors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#EFE6DE",
    marginVertical: 12,
  },
  secondaryTeam: {
    color: "#635C55",
    fontSize: 15,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  liveScore: {
    color: KanchaColors.red,
    fontSize: 28,
    fontWeight: "900",
  },
  liveScoreSeparator: {
    color: "#9A8D80",
    fontSize: 20,
    fontWeight: "700",
  },
  featuredCard: {
    borderRadius: 26,
    backgroundColor: KanchaColors.red,
    padding: 18,
    gap: 14,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredEyebrow: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featuredTitle: {
    color: KanchaColors.white,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  featuredMeta: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    marginTop: 4,
  },
  featuredPanel: {
    borderRadius: 20,
    backgroundColor: KanchaColors.panel,
    padding: 16,
    gap: 10,
  },
  featuredPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  featuredPanelTitle: {
    color: KanchaColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  featuredMatch: {
    color: KanchaColors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  featuredScore: {
    color: "#FFCDC6",
    fontSize: 30,
    fontWeight: "900",
  },
  resultCard: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: KanchaColors.line,
  },
  resultTitle: {
    color: KanchaColors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 8,
  },
  quickValue: {
    color: KanchaColors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  quickLabel: {
    color: KanchaColors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
});
