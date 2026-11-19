import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowLeft, ChevronRight, RotateCcw, Trophy, User } from "@/components/icons";
import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import {
  buildPlayerStats,
  type HistoryEntry,
  type Partner,
  type PlayerTotals,
  type SeasonHistory,
  type SpecialtyBest,
} from "@/features/players/stats";
import { usePlayerRankings } from "@/hooks/use-players";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

function openPlayer(licence: string) {
  router.push({ pathname: "/(tabs)/competitions/player", params: { licence } });
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank, isTitle }: { rank: number; isTitle: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[styles.rankBadge, isTitle && styles.rankBadgeTitle]}
      accessible
      accessibilityLabel={t("ranking.rank_a11y", { rank })}
    >
      {isTitle
        ? <Trophy color={colors.amber} size={18} />
        : <Text style={styles.rankNumber}>{rank}</Text>}
    </View>
  );
}

// ─── Totals ───────────────────────────────────────────────────────────────────

// Two rows of two: four cells in one row leave labels like "Clasificaciones" no room.

function StatCell({ value, label }: { value: number; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statCell} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TotalsStrip({ totals }: { totals: PlayerTotals }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statsRow}>
        <StatCell value={totals.titles} label={t("player.stat_titles")} />
        <View style={styles.statDivider} />
        <StatCell value={totals.runnerUps} label={t("player.stat_runner_ups")} />
      </View>
      <View style={styles.statsRowDivider} />
      <View style={styles.statsRow}>
        <StatCell value={totals.seasons} label={t("player.stat_seasons")} />
        <View style={styles.statDivider} />
        <StatCell value={totals.rankings} label={t("player.stat_rankings")} />
      </View>
    </View>
  );
}

// ─── Best rank per specialty ──────────────────────────────────────────────────

function SpecialtyCard({ best }: { best: SpecialtyBest }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.card, styles.cardRow]} testID={`player-specialty-${best.specialty.id}`}>
      <RankBadge rank={best.bestRank} isTitle={best.bestRank === 1} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{best.specialty.name}</Text>
        {best.titles > 0 && (
          <View style={styles.pillRow}>
            <StatusPill label={t("player.titles_count", { count: best.titles })} tone="amber" />
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Partners ─────────────────────────────────────────────────────────────────

function PartnerCard({ partner }: { partner: Partner }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const label = partner.name ?? t("ranking.licence", { licence: partner.licence });
  const together = t("player.together_count", { count: partner.count });
  return (
    <PressableScale
      style={styles.card}
      onPress={() => openPlayer(partner.licence)}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${together}`}
      accessibilityHint={t("player.open_hint")}
      testID={`player-partner-${partner.licence}`}
    >
      <View style={styles.pressableRow}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardMeta}>{together}</Text>
        </View>
        <ChevronRight color={colors.muted} size={18} />
      </View>
    </PressableScale>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const partners = entry.partners
    .map((p) => p.name ?? t("ranking.licence", { licence: p.licence }))
    .join(" / ");
  return (
    <View
      style={[styles.card, styles.cardRow, entry.isTitle && styles.cardWon]}
      testID={`player-ranking-${entry.id}`}
    >
      <RankBadge rank={entry.rank} isTitle={entry.isTitle} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{entry.specialtyName}</Text>
        <Text style={styles.cardMeta}>{`${entry.categoryName} · ${entry.clubName}`}</Text>
        {partners
          ? <Text style={styles.partners}>{t("player.with", { names: partners })}</Text>
          : null}
        <View style={styles.pillRow}>
          {entry.isTitle
            ? <StatusPill label={t("ranking.champion")} tone="amber" />
            : <StatusPill label={entry.phase} tone={entry.isForfeit ? "red" : "soft"} />}
          {!entry.final && <StatusPill label={t("ranking.provisional")} tone="soft" />}
        </View>
      </View>
    </View>
  );
}

function SeasonSection({ season }: { season: SeasonHistory }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.seasonSection}>
      <View style={styles.seasonDivider}>
        <View style={styles.seasonDividerLine} />
        <Text style={styles.seasonLabel} accessibilityRole="header">
          {season.competition.name}
        </Text>
        <View style={styles.seasonDividerLine} />
      </View>
      <View style={styles.list}>
        {season.rankings.map((entry) => <HistoryCard key={entry.id} entry={entry} />)}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { licence = "" } = useLocalSearchParams<{ licence: string }>();
  // `isPending`, not `isLoading`: the static web export renders without the
  // licence, so the query is disabled there. Both stay pending, and the static
  // HTML matches the first client render (a spinner) instead of an empty state.
  const {
    data: rankings,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePlayerRankings(licence);

  const stats = rankings ? buildPlayerStats(licence, rankings) : null;
  const isEmpty = rankings?.length === 0;
  const name = stats?.name ?? null;

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="player-screen"
        >
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
            <Text style={styles.backLabel}>{t("common.back")}</Text>
          </Pressable>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <User color="#FFFFFF" size={20} />
            </View>
            <Text style={styles.heroEyebrow}>{t("player.eyebrow")}</Text>
            {isPending
              ? <ActivityIndicator color="#FFFFFF" accessibilityLabel={t("common.loading")} />
              : (
                <>
                  <Text style={styles.heroTitle} accessibilityRole="header">
                    {name ?? t("ranking.licence", { licence })}
                  </Text>
                  {name && licence
                    ? <Text style={styles.heroMeta}>{t("ranking.licence", { licence })}</Text>
                    : null}
                  {stats && stats.clubs.length > 0 && (
                    <Text style={styles.heroMeta}>
                      {stats.clubs.map((c) => c.name).join(" · ")}
                    </Text>
                  )}
                </>
              )}
          </View>

          {/* States */}
          {isError && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorTitle}>{t("player.error_load")}</Text>
              {error instanceof Error && error.message
                ? <Text style={styles.errorDetail}>{error.message}</Text>
                : null}
              <Pressable
                style={styles.retryButton}
                onPress={() => refetch()}
                disabled={isRefetching}
                accessibilityRole="button"
                accessibilityLabel={t("error.retry")}
                accessibilityState={{ busy: isRefetching, disabled: isRefetching }}
              >
                {isRefetching
                  ? <ActivityIndicator color={colors.red} size="small" />
                  : <RotateCcw color={colors.red} size={14} />}
                <Text style={styles.retryLabel}>{t("error.retry")}</Text>
              </Pressable>
            </View>
          )}

          {isEmpty && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t("player.empty")}</Text>
            </View>
          )}

          {stats && stats.totals.rankings > 0 && (
            <>
              <TotalsStrip totals={stats.totals} />

              <View style={styles.section}>
                <SectionHeader eyebrow={t("player.best_eyebrow")} title={t("player.best_title")} />
                {stats.specialties.length > 0
                  ? (
                    <View style={styles.list}>
                      {stats.specialties.map((best) => (
                        <SpecialtyCard key={best.specialty.id} best={best} />
                      ))}
                    </View>
                  )
                  : (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>{t("player.best_empty")}</Text>
                    </View>
                  )}
              </View>

              {stats.partners.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    eyebrow={t("player.partners_eyebrow")}
                    title={t("player.partners_title")}
                  />
                  <View style={styles.list}>
                    {stats.partners.map((partner) => (
                      <PartnerCard key={partner.licence} partner={partner} />
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <SectionHeader
                  eyebrow={t("player.history_eyebrow")}
                  title={t("player.history_title")}
                />
                {stats.seasons.map((season) => (
                  <SeasonSection key={season.competition.id} season={season} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 120,
      gap: 22,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    backLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },

    // Hero
    heroCard: {
      borderRadius: 24,
      backgroundColor: c.redFill,
      padding: 22,
      gap: 8,
    },
    heroIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(0,0,0,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    heroEyebrow: {
      color: c.onRedSoft,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
    heroMeta: { color: c.onRedStrong, fontSize: 14, fontWeight: "600" },

    // States
    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    errorDetail: { color: c.muted, fontSize: 12, fontWeight: "600" },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.red,
      marginTop: 4,
    },
    retryLabel: { color: c.red, fontSize: 14, fontWeight: "700" },
    emptyBox: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line,
    },
    emptyText: {
      color: c.muted,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },

    // Totals
    statsGrid: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    statCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 4,
      gap: 4,
    },
    statValue: {
      color: c.ink,
      fontSize: 26,
      fontWeight: "900",
      lineHeight: 28,
      fontVariant: ["tabular-nums"],
    },
    statLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      textAlign: "center",
    },
    statsRow: { flexDirection: "row" },
    statDivider: {
      width: 1,
      backgroundColor: c.line,
      marginVertical: 12,
    },
    statsRowDivider: { height: 1, backgroundColor: c.line, marginHorizontal: 12 },

    // Sections and cards
    section: { gap: 12 },
    list: { gap: 10 },
    // PressableScale styles its outer view: a row there would shrink-wrap the inner Pressable.
    card: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      padding: 14,
    },
    cardRow: { flexDirection: "row", gap: 14 },
    cardWon: { borderWidth: 2, borderColor: c.amber },
    pressableRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardBody: { flex: 1, gap: 6 },
    cardTitle: { color: c.ink, fontSize: 15, fontWeight: "700" },
    cardMeta: { color: c.muted, fontSize: 12, fontWeight: "600" },
    partners: { color: c.text, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    rankBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cream,
      borderWidth: 1,
      borderColor: c.line,
      alignItems: "center",
      justifyContent: "center",
    },
    rankBadgeTitle: { backgroundColor: c.amberBg, borderColor: c.amber },
    rankNumber: {
      color: c.ink,
      fontSize: 18,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },

    // Season divider
    seasonSection: { gap: 10 },
    seasonDivider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
    },
    seasonDividerLine: { flex: 1, height: 1, backgroundColor: c.line },
    seasonLabel: {
      color: c.ink,
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      flexShrink: 1,
      textAlign: "center",
    },
  });
