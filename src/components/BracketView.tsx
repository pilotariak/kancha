import { ChevronRight, Swords, Trophy, Users } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { KanchaColors } from "@/constants/colors";
import type { Result } from "@/types/competition";

// ─── Shared types (re-exported for details.tsx) ───────────────────────────────

export type PhaseType = "P" | "B1T" | "B2T" | "B3T" | "H" | "Q" | "D" | "F" | "other";

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

const NEUTRAL_PHASE: PhaseColors = {
  pill: KanchaColors.cream,
  border: KanchaColors.line,
  label: KanchaColors.ink,
  count: KanchaColors.muted,
  icon: KanchaColors.ink,
  cardBorder: KanchaColors.line,
};

export const PHASE_COLORS: Record<PhaseType, PhaseColors> = {
  P: NEUTRAL_PHASE,
  B1T: NEUTRAL_PHASE,
  B2T: NEUTRAL_PHASE,
  B3T: NEUTRAL_PHASE,
  H: NEUTRAL_PHASE,
  Q: NEUTRAL_PHASE,
  D: NEUTRAL_PHASE,
  F: {
    pill: KanchaColors.amberBg,
    border: "rgba(200,144,10,0.4)",
    label: "#A86E00",
    count: KanchaColors.amber,
    icon: KanchaColors.amber,
    cardBorder: KanchaColors.red,
  },
  other: NEUTRAL_PHASE,
};

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
  const { scoreA, scoreB } = parseScores(result.scores);
  const hasScore = scoreA != null && scoreB != null;
  const nameA = formatLineup(result.clubALineup) || result.clubA.name;
  const nameB = formatLineup(result.clubBLineup) || result.clubB.name;

  return (
    <View
      style={[
        styles.matchNode,
        !hasScore && styles.matchNodePending,
        { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
      ]}
    >
      <View style={styles.nodeRow}>
        <Text style={[styles.nodeTeam, isFinal && styles.nodeTeamFinal]}>
          {nameA}
        </Text>
        {hasScore
          ? <Text style={[styles.nodeScore, isFinal && styles.nodeScoreFinal]}>{scoreA}</Text>
          : <Text style={styles.nodeScorePending}>—</Text>}
      </View>
      <View style={styles.nodeDivider} />
      <View style={styles.nodeRow}>
        <Text style={[styles.nodeTeam, isFinal && styles.nodeTeamFinal]}>
          {nameB}
        </Text>
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
  const colors = PHASE_COLORS[group.type];
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
  return (
    <View style={styles.connector}>
      <ChevronRight color={KanchaColors.line} size={16} />
    </View>
  );
}

// ─── BracketView ──────────────────────────────────────────────────────────────

export function BracketView({ rounds }: { rounds: RoundGroup[] }) {
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

const COLUMN_WIDTH = 200;

const styles = StyleSheet.create({
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
    backgroundColor: KanchaColors.white,
    overflow: "hidden",
  },
  matchNodePending: { backgroundColor: KanchaColors.card },
  nodeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  nodeTeam: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  nodeTeamFinal: { fontSize: 15, fontWeight: "800" },
  nodeScore: {
    color: KanchaColors.red,
    fontSize: 17,
    fontWeight: "900",
    minWidth: 28,
    textAlign: "right",
  },
  nodeScoreFinal: { fontSize: 22 },
  nodeScorePending: {
    color: KanchaColors.muted,
    fontSize: 16,
    fontWeight: "300",
    minWidth: 18,
    textAlign: "right",
  },
  nodeDivider: {
    height: 1,
    backgroundColor: KanchaColors.line,
  },
});
