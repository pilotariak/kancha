import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { CardGrid } from "@/components/CardGrid";
import { ChevronRight, RotateCcw, Trophy } from "@/components/icons";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { buildRanking, type RankingRow } from "@/features/rankings/ranking";
import { useRankings } from "@/hooks/use-rankings";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import type { RankedPlayer } from "@/types/competition";

// ─── Player link ──────────────────────────────────────────────────────────────

function PlayerLink({ player }: { player: RankedPlayer }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const label = player.name ?? t("ranking.licence", { licence: player.licence });

  return (
    <Pressable
      style={({ pressed }) => [styles.playerLink, pressed && styles.playerLinkPressed]}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/competitions/player",
          params: { licence: player.licence },
        })}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t("player.open_hint")}
      testID={`ranking-player-${player.licence}`}
    >
      <Text style={styles.playerLinkLabel}>{label}</Text>
      <ChevronRight color={colors.muted} size={14} />
    </Pressable>
  );
}

// ─── Ranking card ─────────────────────────────────────────────────────────────

function RankingCard({ row }: { row: RankingRow }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      style={[styles.rankCard, row.isChampion && styles.rankCardChampion]}
      testID={`ranking-row-${row.id}`}
    >
      <View
        style={[styles.rankBadge, row.isChampion && styles.rankBadgeChampion]}
        accessible
        accessibilityLabel={t("ranking.rank_a11y", { rank: row.rank })}
      >
        {row.isChampion
          ? <Trophy color={colors.amber} size={18} />
          : <Text style={styles.rankNumber}>{row.rank}</Text>}
      </View>
      <View style={styles.rankBody}>
        <View style={styles.rankHeader}>
          <Text style={styles.clubName}>{row.clubName}</Text>
          <Text style={styles.teamNumber}>{t("ranking.team", { number: row.teamNumber })}</Text>
        </View>
        {row.players.length > 0 && (
          <View style={styles.players}>
            {row.players.map((p) => <PlayerLink key={p.licence} player={p} />)}
          </View>
        )}
        <View style={styles.rankMeta}>
          {row.isChampion
            ? <StatusPill label={t("ranking.champion")} tone="amber" />
            : <StatusPill label={row.phase} tone={row.isForfeit ? "red" : "soft"} />}
        </View>
      </View>
    </View>
  );
}

// ─── Ranking view ─────────────────────────────────────────────────────────────

interface RankingViewProps {
  competitionId: string;
  specialtyId: string;
  categoryId: string;
  /** Ranking cards per row, from the web grid; one on a phone. */
  columns?: number;
}

export function RankingView(
  { competitionId, specialtyId, categoryId, columns = 1 }: RankingViewProps,
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    data: rankings,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
    isRefetching,
  } = useRankings(competitionId, specialtyId, categoryId);

  const ranking = !isError && rankings ? buildRanking(rankings) : null;
  const rows = ranking?.rows ?? [];

  return (
    <View style={styles.container} testID="ranking-view">
      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow={t("ranking.eyebrow")}
          title={t("ranking.title")}
          subtitle={rows.length > 0 ? t("ranking.teams_count", { count: rows.length }) : undefined}
        />
        {ranking?.status === "final" && (
          <View style={styles.statusRow}>
            <StatusPill label={t("ranking.final")} tone="dark" />
          </View>
        )}
        {ranking?.status === "provisional" && (
          <View style={styles.statusRow}>
            <StatusPill label={t("ranking.provisional")} tone="soft" />
            <Text style={styles.statusNote}>{t("ranking.provisional_note")}</Text>
          </View>
        )}
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator
            color={colors.red}
            size="large"
            accessibilityLabel={t("common.loading")}
          />
        </View>
      )}

      {isError && (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorTitle}>{t("ranking.error_load")}</Text>
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

      {isSuccess && rows.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t("ranking.empty")}</Text>
        </View>
      )}

      {rows.length > 0 && (
        <CardGrid columns={columns} style={styles.rankList}>
          {rows.map((row) => <RankingCard key={row.id} row={row} />)}
        </CardGrid>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { gap: 20 },

    // Section header + ranking status
    sectionBlock: { gap: 12 },
    statusRow: { alignItems: "flex-start", gap: 8 },
    statusNote: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },

    // States
    centered: { paddingVertical: 40, alignItems: "center" },
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

    // Ranking list
    rankList: { gap: 10 },
    rankCard: {
      flexDirection: "row",
      gap: 14,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      padding: 14,
    },
    rankCardChampion: { borderWidth: 2, borderColor: c.amber },
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
    rankBadgeChampion: { backgroundColor: c.amberBg, borderColor: c.amber },
    rankNumber: {
      color: c.ink,
      fontSize: 18,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    rankBody: { flex: 1, gap: 6 },
    rankHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "baseline",
      columnGap: 8,
    },
    clubName: { color: c.ink, fontSize: 15, fontWeight: "700", flexShrink: 1 },
    teamNumber: { color: c.muted, fontSize: 12, fontWeight: "600" },
    players: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    // 36pt tall plus a 4pt hit slop on each side reaches the 44pt touch target.
    playerLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: c.cream,
      borderWidth: 1,
      borderColor: c.line,
    },
    playerLinkPressed: { backgroundColor: c.line },
    playerLinkLabel: { color: c.text, fontSize: 13, fontWeight: "600", flexShrink: 1 },
    rankMeta: { flexDirection: "row" },
  });
