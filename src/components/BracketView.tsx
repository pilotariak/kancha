import { ChevronRight, Swords, Trophy, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { type Palette } from "@/constants/colors";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseScores(scores?: string): { scoreA: string | null; scoreB: string | null } {
  if (!scores) return { scoreA: null, scoreB: null };
  const sets = scores.trim().split(/\s+/);
  const aScores: string[] = [];
  const bScores: string[] = [];
  for (const set of sets) {
    const [a, b] = set.split("/");
    if (a !== undefined && b !== undefined) {
      aScores.push(a);
      bScores.push(b);
    }
  }
  if (aScores.length === 0) return { scoreA: null, scoreB: null };
  return { scoreA: aScores.join("–"), scoreB: bScores.join("–") };
}

function formatLineup(lineup?: { player1?: { name: string }; player2?: { name: string } }): string {
  if (!lineup) return "";
  return [lineup.player1?.name, lineup.player2?.name].filter(Boolean).join(" / ");
}

// ─── Match node ───────────────────────────────────────────────────────────────

function MatchNode(
  { result, isFinal, colors }: { result: Result; isFinal: boolean; colors: PhaseColors },
) {
  const styles = useThemedStyles(makeStyles);
  const { scoreA, scoreB } = parseScores(result.scores);
  const hasScore = scoreA != null && scoreB != null;
  const lineupA = formatLineup(result.clubALineup);
  const lineupB = formatLineup(result.clubBLineup);
  const nameA = lineupA || result.clubA.name;
  const nameB = lineupB || result.clubB.name;

  return (
    <View
      style={[
        styles.matchNode,
        !hasScore && styles.matchNodePending,
        { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
      ]}
    >
      <View style={styles.nodeRow}>
        <View style={styles.nodeTeamInfo}>
          <Text style={[styles.nodeTeam, isFinal && styles.nodeTeamFinal]}>
            {nameA}
          </Text>
          {lineupA ? <Text style={styles.nodeClub}>{result.clubA.name}</Text> : null}
        </View>
        {hasScore
          ? <Text style={[styles.nodeScore, isFinal && styles.nodeScoreFinal]}>{scoreA}</Text>
          : <Text style={styles.nodeScorePending}>—</Text>}
      </View>
      <View style={styles.nodeDivider} />
      <View style={styles.nodeRow}>
        <View style={styles.nodeTeamInfo}>
          <Text style={[styles.nodeTeam, isFinal && styles.nodeTeamFinal]}>
            {nameB}
          </Text>
          {lineupB ? <Text style={styles.nodeClub}>{result.clubB.name}</Text> : null}
        </View>
        {hasScore
          ? <Text style={[styles.nodeScore, isFinal && styles.nodeScoreFinal]}>{scoreB}</Text>
          : <Text style={styles.nodeScorePending}>—</Text>}
      </View>
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
    nodeRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    nodeTeamInfo: {
      flex: 1,
      gap: 2,
    },
    nodeTeam: {
      color: c.ink,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 20,
    },
    nodeClub: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "600",
    },
    nodeTeamFinal: { fontSize: 15, fontWeight: "800" },
    nodeScore: {
      color: c.red,
      fontSize: 17,
      fontWeight: "900",
      minWidth: 28,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    nodeScoreFinal: { fontSize: 22 },
    nodeScorePending: {
      color: c.muted,
      fontSize: 16,
      fontWeight: "300",
      minWidth: 18,
      textAlign: "right",
    },
    nodeDivider: {
      height: 1,
      backgroundColor: c.line,
    },
  });
