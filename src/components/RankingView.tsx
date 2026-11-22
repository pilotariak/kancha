import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronDown, ChevronRight, RotateCcw, Trophy } from "@/components/icons";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { scoreDigits } from "@/constants/typography";
import { GUTTER, TEXT_MAX_WIDTH } from "@/features/layout/breakpoints";
import {
  buildRanking,
  buildTeamRecords,
  formLabel,
  type FormResult,
  phaseLabel,
  playerName,
  type RankingRow,
  rowLabel,
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

// ─── Form ─────────────────────────────────────────────────────────────────────

/** The last results as squares: a win filled green, a loss outlined red, so not by colour alone. */
function FormSquares({ form }: { form: FormResult[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.form} role="img" accessibilityLabel={formLabel(form, t)}>
      {form.map((result, i) => (
        <View
          key={i}
          style={[styles.square, result === "W" ? styles.squareWin : styles.squareLoss]}
        />
      ))}
    </View>
  );
}

// ─── Ranking row ──────────────────────────────────────────────────────────────

/**
 * One team: its rank, its players one per line, and on the right the record over the form; under
 * them, across the row, the club, the team number and the phase. Nothing is cut: long names and
 * club names wrap. `record` is undefined while the results load: the row leaves the record and
 * form out. A one-player team opens the player; a pair opens links to its players. `chevronSlot`
 * keeps a one-player row's record in line with the pairs' when the table has both.
 */
function RankingTableRow({
  row,
  record,
  first,
  chevronSlot,
}: {
  row: RankingRow;
  record: TeamRecord | undefined;
  first: boolean;
  chevronSlot: boolean;
}) {
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
      <View style={styles.top}>
        <View style={styles.rankCell}>
          {row.isChampion
            ? <Trophy color={colors.amber} size={18} />
            : <Text style={styles.rankNumber}>{row.rank}</Text>}
        </View>
        <View style={styles.names}>
          {row.players.map((p) => (
            <Text key={p.licence} style={styles.playerName}>{playerName(p, t)}</Text>
          ))}
        </View>
        {record
          ? (
            <View style={styles.recordCell}>
              <Text style={[styles.record, played === 0 && styles.recordNone]}>
                {played === 0 ? "—" : `${record.wins}-${record.losses}`}
              </Text>
              {record.form.length > 0 ? <FormSquares form={record.form} /> : null}
            </View>
          )
          : null}
        {several
          ? (
            <View style={[styles.chevron, open && styles.chevronOpen]}>
              <ChevronDown color={colors.muted} size={16} />
            </View>
          )
          : chevronSlot
          ? <View style={styles.chevron} />
          : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.clubName}>{row.clubName}</Text>
        <Text style={styles.teamNumber}>{t("ranking.team", { number: row.teamNumber })}</Text>
        <StatusPill
          label={phaseLabel(row, t)}
          tone={row.isChampion ? "amber" : row.isForfeit ? "red" : "soft"}
          size="small"
        />
      </View>
    </>
  );

  const label = rowLabel(row, record, t);

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
  const pairs = rows.some((row) => row.players.length > 1);

  return (
    <View style={styles.container} testID="ranking-view">
      {/* The view toggle names the view: one line says how many teams and how final. */}
      {rows.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryLine} testID="ranking-summary">
            <Text style={styles.teamsCount}>
              {t("ranking.teams_count", { count: rows.length })}
            </Text>
            {ranking?.status === "final"
              ? <StatusPill label={t("ranking.final")} tone="dark" />
              : <StatusPill label={t("ranking.provisional")} tone="soft" />}
          </View>
          {ranking?.status === "provisional"
            ? <Text style={styles.statusNote}>{t("ranking.provisional_note")}</Text>
            : null}
        </View>
      )}

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
          <View style={[styles.tableHead, pairs && styles.tableHeadChevron]} aria-hidden>
            <Text style={[styles.headLabel, styles.headTeam]}>{t("ranking.column_team")}</Text>
            <Text style={styles.headLabel}>{t("ranking.column_record")}</Text>
          </View>
          {rows.map((row, i) => (
            <RankingTableRow
              key={row.id}
              row={row}
              record={records?.get(row.id)}
              first={i === 0}
              chevronSlot={pairs}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { gap: 12 },

    // Team count + ranking status, ending over the table's right edge.
    summary: { width: "100%", maxWidth: TABLE_MAX_WIDTH, gap: 6 },
    summaryLine: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      minHeight: 26,
    },
    teamsCount: {
      color: c.text,
      fontSize: 13,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
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
    row: { gap: 4, paddingVertical: 10, paddingHorizontal: 10 },
    rowPressed: { backgroundColor: c.cream },
    // The ring stays inside the table, whose corners clip it.
    rowFocus: { outlineOffset: -2 },
    top: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    rankCell: { width: 22, minHeight: 18, alignItems: "center", justifyContent: "center" },
    rankNumber: { ...scoreDigits.black, color: c.ink, fontSize: 15, lineHeight: 18 },
    names: { flex: 1, minWidth: 0 },
    playerName: { color: c.ink, fontSize: 14, fontWeight: "700", lineHeight: 18 },
    recordCell: { alignItems: "flex-end", gap: 4 },
    record: { ...scoreDigits.black, color: c.ink, fontSize: 20, lineHeight: 22 },
    recordNone: { color: c.muted },
    form: { flexDirection: "row", gap: 3 },
    square: { width: 10, height: 10, borderRadius: 2 },
    squareWin: { backgroundColor: c.green },
    squareLoss: { borderWidth: 2, borderColor: c.red },
    chevron: { width: 16, alignSelf: "center" },
    chevronOpen: { transform: [{ rotate: "180deg" }] },
    // Under the players and the record, from the players' left edge: wraps rather than cuts.
    meta: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 6,
      rowGap: 4,
      paddingLeft: 30,
    },
    clubName: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },
    teamNumber: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },

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
