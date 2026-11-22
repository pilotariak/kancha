import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CardGrid } from "@/components/CardGrid";
import { ClubLink } from "@/components/ClubLink";
import { Check, ChevronDown, ChevronRight, Swords, Trophy, Users } from "@/components/icons";
import { type Palette } from "@/constants/colors";
import {
  activePage,
  CONNECTOR_WIDTH,
  knockoutColumnWidth,
  knockoutRowWidth,
  poolSummaryLabel,
  splitRounds,
  summarizePool,
} from "@/features/competitions/bracket";
import { parseMatchScore, type Side } from "@/features/competitions/matchScore";
import { CARD_WIDTH, GUTTER } from "@/features/layout/breakpoints";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
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
  /** The side's club: its name links to the club page, whether it is `club` or `name`. */
  clubId: string;
  points: number[] | null;
  outcome: "won" | "lost" | "even";
  isFinal: boolean;
  size: TeamRowsSize;
}

function TeamRow({ name, club, clubId, points, outcome, isFinal, size }: TeamRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const node = size === "node";
  const nameStyle = [
    styles.teamName,
    node && styles.teamNameNode,
    isFinal && (node ? styles.teamNameNodeFinal : styles.teamNameFinal),
    outcome === "won" && styles.teamNameWon,
    outcome === "lost" && styles.teamNameLost,
  ];

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
        {/* Without a lineup, the side's name is its club's. */}
        {club
          ? <Text style={nameStyle}>{name}</Text>
          : <ClubLink club={{ id: clubId, name }} textStyle={nameStyle} style={styles.clubLink} />}
        {club
          ? (
            <ClubLink
              club={{ id: clubId, name: club }}
              textStyle={[styles.teamClub, node && styles.teamClubNode]}
              style={styles.clubLink}
            />
          )
          : null}
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
        clubId={result.clubA.id}
        points={score ? score.sets.map((s) => s.a) : null}
        outcome={outcome("A")}
        isFinal={isFinal}
        size={size}
      />
      <View style={styles.teamDivider} />
      <TeamRow
        name={lineupB || result.clubB.name}
        club={lineupB ? result.clubB.name : null}
        clubId={result.clubB.id}
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
  { result, isFinal, colors, fill }: {
    result: Result;
    isFinal: boolean;
    colors: PhaseColors;
    /**
     * Instead of the fixed column width: "width" takes its column's width, "cell" also its
     * grid cell's height, so the nodes of a row line up.
     */
    fill?: "width" | "cell";
  },
) {
  const styles = useThemedStyles(makeStyles);
  const hasScore = parseMatchScore(result.scores) != null;

  return (
    <View
      style={[
        styles.matchNode,
        fill && styles.matchNodeFill,
        fill === "cell" && styles.matchNodeCell,
        !hasScore && styles.matchNodePending,
        { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
      ]}
    >
      <TeamRows result={result} isFinal={isFinal} size="node" />
    </View>
  );
}

// ─── Round column ─────────────────────────────────────────────────────────────

function RoundPill({ group }: { group: RoundGroup }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const colors = usePhaseColors()[group.type];
  const Icon = group.type === "P" ? Users : group.type === "F" ? Trophy : Swords;

  return (
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
  );
}

/**
 * One round: its pill, then its nodes one card wide. `fill` shares a row's width (fit layout);
 * `width` sets the column's own (the phone knockout row). Either way the nodes take its width.
 */
function RoundColumn(
  { group, fill = false, width }: { group: RoundGroup; fill?: boolean; width?: number },
) {
  const styles = useThemedStyles(makeStyles);
  const colors = usePhaseColors()[group.type];
  const isFinal = group.type === "F";

  return (
    <View style={[styles.column, fill && styles.columnFill, width != null && { width }]}>
      <RoundPill group={group} />
      <View style={styles.columnBody}>
        {group.results.map((r) => (
          <MatchNode
            key={r.id}
            result={r}
            isFinal={isFinal}
            colors={colors}
            fill={fill || width != null ? "width" : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Round grid ───────────────────────────────────────────────────────────────

/** A round of group matches as a grid of `columns` nodes per row. */
function RoundGrid({ group, columns }: { group: RoundGroup; columns: number }) {
  const styles = useThemedStyles(makeStyles);
  const colors = usePhaseColors()[group.type];

  return (
    <View style={styles.grid}>
      <RoundPill group={group} />
      <CardGrid columns={columns}>
        {group.results.map((r) => (
          <MatchNode key={r.id} result={r} isFinal={false} colors={colors} fill="cell" />
        ))}
      </CardGrid>
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

// ─── Knockout row (phone) ─────────────────────────────────────────────────────

/** One dot per round, the round nearest the left edge drawn long. */
function PageDots({ count, active }: { count: number; active: number }) {
  const styles = useThemedStyles(makeStyles);
  return (
    // The round pills name the columns: the dots only show where the row is.
    <View
      style={styles.dots}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="bracket-page-dots"
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
          testID={i === active ? "bracket-page-dot-active" : undefined}
        />
      ))}
    </View>
  );
}

/**
 * The knockout rounds side by side, in a row that bleeds over the gutters and scrolls sideways,
 * snapping to a column. The columns leave room for the edge of the next one, under a cream fade;
 * dots under the row follow the scroll.
 */
function KnockoutRow({ rounds }: { rounds: RoundGroup[] }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  // The bracket takes the content width on a phone: a first render at the right width, then the
  // measured frame.
  const { contentWidth } = useWebLayout();
  const [frameWidth, setFrameWidth] = useState(contentWidth);
  const [offset, setOffset] = useState(0);

  const columnWidth = knockoutColumnWidth(frameWidth, rounds.length);
  const pageWidth = columnWidth + CONNECTOR_WIDTH;
  const maxOffset = Math.max(0, knockoutRowWidth(columnWidth, rounds.length) - frameWidth);
  const page = activePage(offset, pageWidth, rounds.length, maxOffset);
  const hasMore = maxOffset - offset > 1;

  // The scroll re-renders the dots and the fade, not the columns.
  const columns = useMemo(
    () =>
      rounds.map((group, i) => (
        <React.Fragment key={group.type}>
          <RoundColumn group={group} width={columnWidth} />
          {i < rounds.length - 1 && <RoundConnector />}
        </React.Fragment>
      )),
    [rounds, columnWidth],
  );

  return (
    <View>
      <View onLayout={(e) => setFrameWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={pageWidth}
          decelerationRate="fast"
          onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.container, rounds.length > 1 && styles.containerDots]}
          testID="bracket-knockout"
        >
          {columns}
        </ScrollView>
        {hasMore
          ? (
            <LinearGradient
              pointerEvents="none"
              // An 8-digit hex keeps the cream hue: "transparent" fades through gray on web.
              colors={[`${colors.cream}00`, colors.cream]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fade}
            />
          )
          : null}
      </View>
      {rounds.length > 1 && <PageDots count={rounds.length} active={page} />}
    </View>
  );
}

// ─── Pools (phone) ────────────────────────────────────────────────────────────

/**
 * A group round under the knockout row: its pill, then one line that sums up its matches and
 * opens them as a column of nodes.
 */
function PoolRound({ group }: { group: RoundGroup }) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const phaseColors = usePhaseColors()[group.type];
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // The language the strings resolved to, so a "de" device gets an English date too.
  const summary = poolSummaryLabel(
    summarizePool(group.results),
    t,
    i18n.resolvedLanguage ?? "en",
  );

  return (
    <View style={styles.pool}>
      <RoundPill group={group} />
      <Pressable
        onPress={() => setOpen((value) => !value)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="button"
        aria-expanded={open}
        style={(state: InteractionState) => [
          styles.poolSummary,
          state.pressed && styles.poolSummaryPressed,
          hovered && interaction.hover,
          showsFocusRing(state) && interaction.focusRing,
        ]}
        testID={`bracket-pool-toggle-${group.type}`}
      >
        <Text style={styles.poolSummaryText}>{summary}</Text>
        <View style={open && styles.chevronOpen}>
          <ChevronDown color={colors.muted} size={18} />
        </View>
      </Pressable>
      {open && (
        <View style={styles.columnBody}>
          {group.results.map((r) => (
            <MatchNode key={r.id} result={r} isFinal={false} colors={phaseColors} fill="width" />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── BracketView ──────────────────────────────────────────────────────────────

/**
 * The knockout rounds first, then the group rounds. On a phone (one column), the knockout rounds
 * sit side by side in a row that scrolls sideways, and each group round folds into one summary
 * line under it; with group rounds only, they keep their sideways row of columns. With more
 * `columns` (web), nothing scrolls sideways: the knockout rounds share the width, and the group
 * rounds follow as grids of that many nodes per row.
 */
export function BracketView({ rounds, columns = 1 }: { rounds: RoundGroup[]; columns?: number }) {
  const styles = useThemedStyles(makeStyles);
  const { knockout, groups } = useMemo(() => splitRounds(rounds), [rounds]);

  if (columns > 1) {
    return (
      <View style={styles.fit}>
        {knockout.length > 0 && (
          <View style={styles.fitRow}>
            {knockout.map((group) => <RoundColumn key={group.type} group={group} fill />)}
          </View>
        )}
        {groups.map((group) => <RoundGrid key={group.type} group={group} columns={columns} />)}
      </View>
    );
  }

  if (knockout.length > 0) {
    return (
      <View style={styles.phone}>
        <KnockoutRow rounds={knockout} />
        {groups.map((group) => <PoolRound key={group.type} group={group} />)}
      </View>
    );
  }

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

/** The phone card width: a round column holds the same match nodes as a phone shows. */
const COLUMN_WIDTH = CARD_WIDTH;
/**
 * Fit layout: the narrowest a knockout column gets while names stay readable; more rounds than
 * fit wrap onto a new line.
 */
const FIT_MIN_COLUMN_WIDTH = 220;
const FIT_GAP = 24;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: GUTTER,
      paddingTop: 4,
      paddingBottom: 16,
      alignItems: "flex-start",
    },
    // Phone, with knockout rounds: the row and its dots, then the pools.
    phone: { gap: 20 },
    containerDots: { paddingBottom: 12 },
    fade: { position: "absolute", top: 0, right: 0, bottom: 0, width: 32 },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.lineStrong },
    dotActive: { width: 18, backgroundColor: c.ink },
    pool: { paddingHorizontal: GUTTER, gap: 10 },
    poolSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
    },
    poolSummaryPressed: { backgroundColor: c.cream },
    poolSummaryText: { flex: 1, color: c.ink, fontSize: 14, fontWeight: "700", lineHeight: 20 },
    chevronOpen: { transform: [{ rotate: "180deg" }] },
    column: {
      width: COLUMN_WIDTH,
      gap: 10,
    },
    // Fit layout: columns share the row, between the minimum and the scroll layout's width.
    columnFill: {
      width: "auto",
      flexGrow: 1,
      flexBasis: FIT_MIN_COLUMN_WIDTH,
      maxWidth: COLUMN_WIDTH,
    },
    fit: { gap: FIT_GAP, paddingTop: 4 },
    fitRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: FIT_GAP },
    grid: { gap: 10 },
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
      width: CONNECTOR_WIDTH,
      paddingTop: 50,
      alignItems: "center",
    },
    matchNode: {
      width: COLUMN_WIDTH,
      borderRadius: 14,
      backgroundColor: c.white,
      overflow: "hidden",
    },
    matchNodeFill: { width: "auto" },
    matchNodeCell: { flex: 1 },
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
    // The club link spans the name only, not the rest of the column.
    clubLink: { alignSelf: "flex-start" },
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
