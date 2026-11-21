import { router } from "expo-router";
import type { TFunction } from "i18next";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronDown, ChevronRight, RotateCcw, Trophy } from "@/components/icons";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { GUTTER, TEXT_MAX_WIDTH } from "@/features/layout/breakpoints";
import {
  buildRanking,
  buildTeamRecords,
  type FormResult,
  type RankingRow,
  type TeamRecord,
} from "@/features/rankings/ranking";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useResultsByCompetition } from "@/hooks/use-matches";
import { useRankings } from "@/hooks/use-rankings";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import type { RankedPlayer } from "@/types/competition";

/** On web, the table keeps to the text column, inside the screen's gutters. */
const TABLE_MAX_WIDTH = TEXT_MAX_WIDTH - 2 * GUTTER;

function playerName(player: RankedPlayer, t: TFunction): string {
  return player.name ?? t("ranking.licence", { licence: player.licence });
}

function openPlayer(licence: string) {
  router.push({ pathname: "/(tabs)/competitions/player", params: { licence } });
}

// ─── Player link ──────────────────────────────────────────────────────────────

function PlayerLink({ player }: { player: RankedPlayer }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const label = playerName(player, t);

  return (
    <Pressable
      style={({ pressed }) => [styles.playerLink, pressed && styles.playerLinkPressed]}
      onPress={() => openPlayer(player.licence)}
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

// ─── Form chips ───────────────────────────────────────────────────────────────

function FormChips({ form }: { form: FormResult[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.form}>
      {form.map((result, i) => {
        const win = result === "W";
        return (
          <View key={i} style={[styles.chip, win ? styles.chipWin : styles.chipLoss]}>
            <Text style={[styles.chipLetter, win ? styles.chipLetterWin : styles.chipLetterLoss]}>
              {t(win ? "ranking.form_win" : "ranking.form_loss")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Ranking row ──────────────────────────────────────────────────────────────

/** What a screen reader says for a row, in one sentence. */
function rowSentence(row: RankingRow, record: TeamRecord | undefined, t: TFunction): string {
  const parts = [
    t("ranking.rank_a11y", { rank: row.rank }),
    ...row.players.map((p) => playerName(p, t)),
    row.clubName,
    t("ranking.team", { number: row.teamNumber }),
    row.isChampion ? t("ranking.champion") : row.phase,
  ];
  if (record && record.wins + record.losses === 0) {
    parts.push(t("ranking.no_results_a11y"));
  } else if (record) {
    const form = record.form.map((r) =>
      t(r === "W" ? "ranking.form_win_a11y" : "ranking.form_loss_a11y")
    );
    parts.push(
      t("ranking.wins_a11y", { count: record.wins }),
      t("ranking.losses_a11y", { count: record.losses }),
      t("ranking.form_a11y", { results: form.join(", ") }),
    );
  }
  return parts.join(", ");
}

/**
 * One team, in two lines beside its rank: the players, then the record and form; the club and
 * team number, then the phase. `record` is undefined while the results load: the row leaves the
 * record and form out. A one-player team opens the player; a pair opens links to its players.
 */
function RankingTableRow(
  { row, record, first }: { row: RankingRow; record: TeamRecord | undefined; first: boolean },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const [open, setOpen] = useState(false);

  const single = row.players.length === 1 ? row.players[0] : null;
  const several = row.players.length > 1;
  const played = record ? record.wins + record.losses : 0;

  const summary = (
    <>
      <View style={styles.rankCell}>
        {row.isChampion
          ? <Trophy color={colors.amber} size={18} />
          : <Text style={styles.rankNumber}>{row.rank}</Text>}
      </View>
      <View style={styles.teamCell}>
        <View style={styles.line}>
          <View style={styles.names}>
            {row.players.map((p) => (
              // A pair gives each player a line; a long single name may take two.
              <Text key={p.licence} style={styles.playerName} numberOfLines={several ? 1 : 2}>
                {playerName(p, t)}
              </Text>
            ))}
          </View>
          {record
            ? (
              <View style={styles.recordLine}>
                <Text style={[styles.record, played === 0 && styles.recordNone]}>
                  {played === 0 ? "—" : `${record.wins}-${record.losses}`}
                </Text>
                {record.form.length > 0 ? <FormChips form={record.form} /> : null}
              </View>
            )
            : null}
        </View>
        <View style={[styles.line, styles.lineCenter]}>
          <View style={styles.clubLine}>
            <Text style={styles.clubName} numberOfLines={1}>{row.clubName}</Text>
            <Text style={styles.teamNumber} numberOfLines={1}>
              {t("ranking.team", { number: row.teamNumber })}
            </Text>
          </View>
          {row.isChampion
            ? <StatusPill label={t("ranking.champion")} tone="amber" size="small" />
            : <StatusPill label={row.phase} tone={row.isForfeit ? "red" : "soft"} size="small" />}
        </View>
      </View>
      {several
        ? (
          <View style={open && styles.chevronOpen}>
            <ChevronDown color={colors.muted} size={16} />
          </View>
        )
        : null}
    </>
  );

  const label = rowSentence(row, record, t);

  return (
    <View style={[!first && styles.rowLine]} testID={`ranking-row-${row.id}`}>
      {single || several
        ? (
          <Pressable
            onPress={() => (single ? openPlayer(single.licence) : setOpen(!open))}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={t(single ? "player.open_hint" : "ranking.players_hint")}
            aria-expanded={several ? open : undefined}
            style={(state: InteractionState) => [
              styles.row,
              (state.pressed || state.hovered) && styles.rowPressed,
              showsFocusRing(state) && [interaction.focusRing, styles.rowFocus],
            ]}
            testID={single
              ? `ranking-player-${single.licence}`
              : `ranking-row-toggle-${row.id}`}
          >
            {summary}
          </Pressable>
        )
        : (
          <View style={styles.row} accessible accessibilityLabel={label} role="group">
            {summary}
          </View>
        )}
      {several && open
        ? (
          <View style={styles.players}>
            {row.players.map((p) => <PlayerLink key={p.licence} player={p} />)}
          </View>
        )
        : null}
    </View>
  );
}

// ─── Ranking view ─────────────────────────────────────────────────────────────

interface RankingViewProps {
  competitionId: string;
  specialtyId: string;
  categoryId: string;
}

export function RankingView({ competitionId, specialtyId, categoryId }: RankingViewProps) {
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
  // The results screen loaded these already, under the same key: no new request.
  const { data: results } = useResultsByCompetition(competitionId, specialtyId, categoryId);

  const ranking = useMemo(
    () => (!isError && rankings ? buildRanking(rankings) : null),
    [isError, rankings],
  );
  const rows = useMemo(() => ranking?.rows ?? [], [ranking]);
  const records = useMemo(
    () => (results && rows.length > 0 ? buildTeamRecords(rows, results) : null),
    [results, rows],
  );

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
        <View style={styles.table} testID="ranking-table">
          {/* Each row reads as a sentence: the column titles are for the eye only. */}
          <View
            style={[
              styles.tableHead,
              rows.some((row) => row.players.length > 1) && styles.tableHeadChevron,
            ]}
            aria-hidden
          >
            <Text style={[styles.headLabel, styles.headTeam]}>{t("ranking.column_team")}</Text>
            <Text style={styles.headLabel}>{t("ranking.column_record")}</Text>
          </View>
          {rows.map((row, i) => (
            <RankingTableRow key={row.id} row={row} record={records?.get(row.id)} first={i === 0} />
          ))}
        </View>
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

    // Table: one card, rows split by hairlines.
    table: {
      width: "100%",
      maxWidth: TABLE_MAX_WIDTH,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    tableHead: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      // The titles start over the players and end over the form, past the rank.
      paddingLeft: 40,
      paddingRight: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    // Pairs have a chevron after the form: 16px and the 8px gap.
    tableHeadChevron: { paddingRight: 34 },
    headLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    headTeam: { flex: 1 },
    rowLine: { borderTopWidth: 1, borderTopColor: c.line },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 52,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    rowPressed: { backgroundColor: c.cream },
    // The ring stays inside the table, whose corners clip it.
    rowFocus: { outlineOffset: -2 },
    rankCell: { width: 22, alignItems: "center" },
    rankNumber: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    teamCell: { flex: 1, minWidth: 0, gap: 4 },
    line: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    lineCenter: { alignItems: "center" },
    names: { flex: 1, minWidth: 0 },
    playerName: { color: c.ink, fontSize: 14, fontWeight: "700", lineHeight: 18 },
    clubLine: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "baseline", gap: 6 },
    clubName: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 16,
      flexShrink: 1,
    },
    teamNumber: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 16,
      flexShrink: 0,
    },
    recordLine: { flexDirection: "row", alignItems: "center", gap: 5, height: 18 },
    record: {
      color: c.ink,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 18,
      fontVariant: ["tabular-nums"],
    },
    recordNone: { color: c.muted, fontWeight: "400" },
    form: { flexDirection: "row", gap: 3 },
    chip: {
      width: 16,
      height: 16,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    chipWin: { backgroundColor: c.greenSoft },
    chipLoss: { backgroundColor: c.redSoft },
    chipLetter: { fontSize: 10, fontWeight: "800", lineHeight: 12 },
    chipLetterWin: { color: c.green },
    chipLetterLoss: { color: c.red },
    chevronOpen: { transform: [{ rotate: "180deg" }] },

    // A pair's players, under its row once opened.
    players: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingLeft: 40,
      paddingRight: 10,
      paddingBottom: 12,
    },
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
  });
