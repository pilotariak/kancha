import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Check, ChevronRight, Swords, Trophy, Users } from "@/components/icons";
import { type Palette } from "@/constants/colors";
import { parseMatchScore, type Side } from "@/features/competitions/matchScore";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import type { Result } from "@/types/competition";

// ─── Shared types (re-exported for details.tsx) ───────────────────────────────

export type PhaseType =
  | "P"
  | "B"
  | "BM"
  | "B1T"
  | "B2T"
  | "B3T"
  | "S"
  | "H"
  | "Q"
  | "D"
  | "F"
  | "other";

export interface RoundGroup {
  type: PhaseType;
  results: Result[];
}

export interface PhaseColors {
  pill: string;
  border: string;
  label: string;
  count: string;
  icon: string;
  cardBorder: string;
}

function makePhaseColors(c: Palette): Record<PhaseType, PhaseColors> {
  const neutral: PhaseColors = {
    pill: c.cream,
    border: c.line,
    label: c.ink,
    count: c.muted,
    icon: c.ink,
    cardBorder: c.line,
  };
  return {
    P: neutral,
    B: neutral,
    BM: neutral,
    B1T: neutral,
    B2T: neutral,
    B3T: neutral,
    S: neutral,
    H: neutral,
    Q: neutral,
    D: neutral,
    F: {
      pill: c.amberBg,
      border: "rgba(200,144,10,0.4)",
      label: c.amber,
      count: c.amber,
      icon: c.amber,
      cardBorder: c.red,
    },
    other: neutral,
  };
}

/** Theme-aware phase colors for round pills and bracket accents. */
export function usePhaseColors(): Record<PhaseType, PhaseColors> {
  const { colors } = useTheme();
  return useMemo(() => makePhaseColors(colors), [colors]);
}

// ─── Team rows (shared with the match cards in details.tsx) ──────────────────

function formatLineup(lineup?: { player1?: { name: string }; player2?: { name: string } }): string {
  if (!lineup) return "";
  return [lineup.player1?.name, lineup.player2?.name].filter(Boolean).join(" / ");
}

/** "card" for the list view, "node" for the narrower bracket columns. */
export type TeamRowsSize = "card" | "node";

interface TeamRowProps {
  name: string;
  club: string | null;
  points: number[] | null;
  outcome: "won" | "lost" | "even";
  isFinal: boolean;
  size: TeamRowsSize;
}

function TeamRow({ name, club, points, outcome, isFinal, size }: TeamRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const node = size === "node";

  return (
    <View style={[styles.teamRow, node && styles.teamRowNode]}>
      <View style={styles.winnerSlot}>
        {outcome === "won" && (
          <View accessible accessibilityRole="image" accessibilityLabel={t("details.winner")}>
            <Check color={colors.green} size={node ? 14 : 16} strokeWidth={3} />
          </View>
        )}
      </View>
      <View style={styles.teamInfo}>
        <Text
          style={[
            styles.teamName,
            node && styles.teamNameNode,
            isFinal && (node ? styles.teamNameNodeFinal : styles.teamNameFinal),
            outcome === "won" && styles.teamNameWon,
            outcome === "lost" && styles.teamNameLost,
          ]}
        >
          {name}
        </Text>
        {club ? <Text style={[styles.teamClub, node && styles.teamClubNode]}>{club}</Text> : null}
      </View>
      {points
        ? (
          <View style={styles.sets}>
            {points.map((p, i) => (
              <Text
                key={i}
                style={[
                  styles.set,
                  node && styles.setNode,
                  isFinal && (node ? styles.setNodeFinal : styles.setFinal),
                  outcome === "won" && styles.setWon,
                  outcome === "lost" && styles.setLost,
                ]}
              >
                {p}
              </Text>
            ))}
          </View>
        )
        : <Text style={[styles.scorePending, node && styles.scorePendingNode]}>—</Text>}
    </View>
  );
}

/**
 * Both teams of a match, one score column per set. The team that won more sets
 * gets a green check, bold ink sets; the other one muted sets. No mark when the
 * score is missing or the sets are even.
 */
export function TeamRows(
  { result, isFinal, size }: { result: Result; isFinal: boolean; size: TeamRowsSize },
) {
  const styles = useThemedStyles(makeStyles);
  const score = parseMatchScore(result.scores);
  const lineupA = formatLineup(result.clubALineup);
  const lineupB = formatLineup(result.clubBLineup);
  const outcome = (side: Side) => !score?.winner ? "even" : score.winner === side ? "won" : "lost";

  return (
    <View>
      <TeamRow
        name={lineupA || result.clubA.name}
        club={lineupA ? result.clubA.name : null}
        points={score ? score.sets.map((s) => s.a) : null}
        outcome={outcome("A")}
        isFinal={isFinal}
        size={size}
      />
      <View style={styles.teamDivider} />
      <TeamRow
        name={lineupB || result.clubB.name}
        club={lineupB ? result.clubB.name : null}
        points={score ? score.sets.map((s) => s.b) : null}
        outcome={outcome("B")}
        isFinal={isFinal}
        size={size}
      />
    </View>
  );
}

// ─── Match node ───────────────────────────────────────────────────────────────

function MatchNode(
  { result, isFinal, colors }: { result: Result; isFinal: boolean; colors: PhaseColors },
) {
  const styles = useThemedStyles(makeStyles);
  const hasScore = parseMatchScore(result.scores) != null;

  return (
    <View
      style={[
        styles.matchNode,
        !hasScore && styles.matchNodePending,
        { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
      ]}
    >
      <TeamRows result={result} isFinal={isFinal} size="node" />
    </View>
  );
}

// ─── Round column ─────────────────────────────────────────────────────────────

function RoundColumn({ group }: { group: RoundGroup }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const colors = usePhaseColors()[group.type];
  const isFinal = group.type === "F";
  const Icon = group.type === "P" ? Users : isFinal ? Trophy : Swords;

  return (
    <View style={styles.column}>
      <View
        style={[styles.columnHeader, { backgroundColor: colors.pill, borderColor: colors.border }]}
      >
        <Icon color={colors.icon} size={11} />
        <Text style={[styles.columnHeaderLabel, { color: colors.label }]} numberOfLines={1}>
          {t(`rounds.${group.type}`)}
        </Text>
        <Text style={[styles.columnHeaderCount, { color: colors.count }]}>
          {group.results.length}
        </Text>
      </View>
      <View style={styles.columnBody}>
        {group.results.map((r) => (
          <MatchNode key={r.id} result={r} isFinal={isFinal} colors={colors} />
        ))}
      </View>
    </View>
  );
}

// ─── Connector ────────────────────────────────────────────────────────────────

function RoundConnector() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.connector}>
      <ChevronRight color={colors.line} size={16} />
    </View>
  );
}

// ─── BracketView ──────────────────────────────────────────────────────────────

export function BracketView({ rounds }: { rounds: RoundGroup[] }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {rounds.map((group, i) => (
        <React.Fragment key={group.type}>
          <RoundColumn group={group} />
          {i < rounds.length - 1 && <RoundConnector />}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const COLUMN_WIDTH = 350;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 16,
      alignItems: "flex-start",
    },
    column: {
      width: COLUMN_WIDTH,
      gap: 10,
    },
    columnHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    columnHeaderLabel: {
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    columnHeaderCount: {
      fontSize: 11,
      fontWeight: "600",
    },
    columnBody: { gap: 10 },
    connector: {
      width: 32,
      paddingTop: 50,
      alignItems: "center",
    },
    matchNode: {
      width: COLUMN_WIDTH,
      borderRadius: 14,
      backgroundColor: c.white,
      overflow: "hidden",
    },
    matchNodePending: { backgroundColor: c.card },

    // Team rows: "card" sizes first, then the "node" and final overrides.
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
    teamRowNode: { paddingHorizontal: 14, paddingVertical: 10 },
    winnerSlot: { width: 16, alignItems: "center" },
    teamInfo: { flex: 1, gap: 2 },
    teamName: { color: c.ink, fontSize: 15, fontWeight: "700" },
    teamNameNode: { fontSize: 14, lineHeight: 20 },
    teamNameFinal: { fontSize: 16 },
    teamNameNodeFinal: { fontSize: 15 },
    teamNameWon: { fontWeight: "800" },
    teamNameLost: { fontWeight: "600" },
    teamClub: { color: c.muted, fontSize: 12, fontWeight: "600" },
    teamClubNode: { fontSize: 11 },
    // A fixed column per set, right-aligned, keeps 7 above 15 in both rows.
    sets: { flexDirection: "row", gap: 12 },
    set: {
      color: c.ink,
      fontSize: 22,
      fontWeight: "700",
      minWidth: 30,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    setNode: { fontSize: 17, minWidth: 24 },
    setFinal: { fontSize: 28, minWidth: 38 },
    setNodeFinal: { fontSize: 22, minWidth: 30 },
    setWon: { fontWeight: "900" },
    setLost: { color: c.muted, fontWeight: "400" },
    scorePending: {
      color: c.muted,
      fontSize: 20,
      fontWeight: "300",
      minWidth: 28,
      textAlign: "right",
    },
    scorePendingNode: { fontSize: 16, minWidth: 18 },
    teamDivider: { height: 1, backgroundColor: c.line },
  });
