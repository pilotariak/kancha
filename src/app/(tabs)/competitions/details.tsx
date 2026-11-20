import { Stack, useLocalSearchParams } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BracketView, RoundGroup, TeamRows, usePhaseColors } from "@/components/BracketView";
import { LayoutList, ListOrdered, Network, Swords, Trophy, Users } from "@/components/icons";
import { RankingView } from "@/components/RankingView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { dateTone, formatMatchDate } from "@/features/competitions/matchDate";
import { parseMatchScore } from "@/features/competitions/matchScore";
import { useCategories } from "@/hooks/use-categories";
import { useCompetition } from "@/hooks/use-competitions";
import { useResultsByCompetition } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

import type { PhaseColors, PhaseType } from "@/components/BracketView";
import type { Result } from "@/types/competition";

// ─── Phase parsing ────────────────────────────────────────────────────────────

interface ParsedPhase {
  type: PhaseType;
  number: number;
}

function parsePhase(phase?: string): ParsedPhase {
  if (!phase) return { type: "other", number: 0 };
  // Match B1T/B2T/B3T, then BM (ctpb barrage maintien), then a bare B (ctpb
  // barrage), then single letters P/Q/D/F/H/S. Order matters: longer/more
  // specific patterns come first so "BM"/"B1T" aren't swallowed by bare "B".
  const m = phase.match(/(B[123]T|BM|B|[PQDFHS])\s*(\d+)\s*$/);
  if (!m) return { type: "other", number: 0 };
  return { type: m[1] as PhaseType, number: parseInt(m[2], 10) };
}

const ROUND_ORDER: Record<PhaseType, number> = {
  P: 0,
  B: 1,
  BM: 2,
  B1T: 3,
  B2T: 4,
  B3T: 5,
  S: 6,
  H: 7,
  Q: 8,
  D: 9,
  F: 10,
  other: 11,
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

function groupByRound(results: Result[]): RoundGroup[] {
  const map = new Map<PhaseType, Result[]>();
  for (const r of results) {
    const { type } = parsePhase(r.phase);
    if (!map.has(type)) map.set(type, []);
    map.get(type)!.push(r);
  }
  return [...map.entries()]
    .sort(([a], [b]) => ROUND_ORDER[a] - ROUND_ORDER[b])
    .map(([type, items]) => ({
      type,
      results: [...items].sort((a, b) => {
        const na = parsePhase(a.phase).number;
        const nb = parsePhase(b.phase).number;
        return na - nb;
      }),
    }));
}

// ─── Round header ─────────────────────────────────────────────────────────────

function RoundHeader({ type, count }: { type: PhaseType; count: number }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const colors = usePhaseColors()[type];
  const Icon = type === "P" ? Users : type === "F" ? Trophy : Swords;

  return (
    <View style={styles.roundDivider}>
      <View style={styles.roundDividerLine} />
      <View
        style={[styles.roundDividerPill, {
          backgroundColor: colors.pill,
          borderColor: colors.border,
        }]}
      >
        <Icon color={colors.icon} size={13} />
        <Text style={[styles.roundDividerLabel, { color: colors.label }]}>
          {t(`rounds.${type}`)}
        </Text>
        <Text style={[styles.roundDividerCount, { color: colors.count }]}>
          {count}
        </Text>
      </View>
      <View style={styles.roundDividerLine} />
    </View>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ result, phaseType }: { result: Result; phaseType: PhaseType }) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const hasScore = parseMatchScore(result.scores) != null;
  const { number } = parsePhase(result.phase);
  // "P 3" reads "Pools 3"; a phase the parser does not know is shown as Frontis sent it.
  const phaseLabel = phaseType === "other"
    ? result.phase ?? ""
    : t("details.phase_label", { round: t(`rounds.${phaseType}`), number });
  // The language the strings resolved to, so a "de" device gets an English date too.
  const dateLabel = formatMatchDate(result.dateMatch, i18n.resolvedLanguage ?? "en");
  const todayTone = dateTone(result.dateMatch);
  const colors: PhaseColors = usePhaseColors()[phaseType];
  const isFinal = phaseType === "F";

  const cardStyle = [
    styles.matchCard,
    !hasScore && styles.matchCardPending,
    { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
  ];

  return (
    <View style={cardStyle} testID={`result-card-${result.id}`}>
      <View style={styles.matchHeader}>
        <Text
          style={[styles.matchHeaderText, styles.matchPhase, isFinal && { color: colors.label }]}
          numberOfLines={1}
        >
          {phaseLabel}
        </Text>
        {todayTone
          ? <StatusPill label={t("details.today")} tone={todayTone} />
          : dateLabel
          ? <Text style={styles.matchHeaderText}>{dateLabel}</Text>
          : null}
      </View>
      <View style={styles.matchCardInner}>
        <TeamRows result={result} isFinal={isFinal} size="card" />
      </View>
    </View>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────

interface StatsStripProps {
  total: number;
  played: number;
  pending: number;
}

function StatCell({ value, label }: { value: number; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatsStrip({ total, played, pending }: StatsStripProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statsStrip}>
      <StatCell value={total} label={t("details.stat_total")} />
      <View style={styles.statDivider} />
      <StatCell value={played} label={t("details.stat_played")} />
      <View style={styles.statDivider} />
      <StatCell value={pending} label={t("details.stat_pending")} />
    </View>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

type ViewMode = "list" | "bracket" | "ranking";

const VIEW_MODES: { mode: ViewMode; icon: LucideIcon; labelKey: string }[] = [
  { mode: "list", icon: LayoutList, labelKey: "details.view_list" },
  { mode: "bracket", icon: Network, labelKey: "details.view_bracket" },
  { mode: "ranking", icon: ListOrdered, labelKey: "details.view_ranking" },
];

function ViewToggle(
  { mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.toggleRow}>
      {VIEW_MODES.map(({ mode: option, icon: Icon, labelKey }) => {
        const active = mode === option;
        return (
          <Pressable
            key={option}
            style={[styles.togglePill, active && styles.togglePillActive]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={t(labelKey)}
            accessibilityState={{ selected: active }}
          >
            <Icon size={12} color={active ? "#FFFFFF" : colors.muted} />
            <Text style={[styles.togglePillLabel, active && styles.togglePillLabelActive]}>
              {t(labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompetitionDetailsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { id, specialtyId, categoryId } = useLocalSearchParams<{
    id: string;
    specialtyId: string;
    categoryId: string;
  }>();

  const { width: screenWidth } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: competition, isPending: loadingComp } = useCompetition(id ?? "");
  const { data: specialties } = useSpecialties();
  const { data: categories } = useCategories();
  const {
    data: results,
    isPending: loadingResults,
    isError,
    error,
  } = useResultsByCompetition(id ?? "", specialtyId, categoryId);

  const rounds = results ? groupByRound(results) : [];
  const totalMatches = results?.length ?? 0;
  const playedMatches = results?.filter((r) => r.scores).length ?? 0;
  const pendingMatches = totalMatches - playedMatches;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="competition-details-screen"
      >
        <ScreenHeader
          backLabel={t("details.back")}
          title={competition?.name ?? t("common.competition_fallback")}
          subtitle={[competition?.year, competition?.level].filter(Boolean).join(" · ")}
          loading={loadingComp}
        />

        <View style={styles.body}>
          {/* Context badges */}
          {(specialtyId || categoryId) && (
            <View style={styles.badgeRow}>
              {specialtyId && specialties && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {specialties.find((s) => s.id === specialtyId)?.name ?? specialtyId}
                  </Text>
                </View>
              )}
              {categoryId && categories && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {categories.find((c) => c.id === categoryId)?.name ?? categoryId}
                  </Text>
                </View>
              )}
            </View>
          )}

          <ViewToggle mode={viewMode} onChange={setViewMode} />

          {viewMode === "ranking"
            ? (
              <RankingView
                competitionId={id ?? ""}
                specialtyId={specialtyId ?? ""}
                categoryId={categoryId ?? ""}
              />
            )
            : (
              <>
                {/* States */}
                {isError && (
                  <View style={styles.errorBox} accessibilityRole="alert">
                    <Text style={styles.errorText}>
                      {error instanceof Error ? error.message : t("details.error_load")}
                    </Text>
                  </View>
                )}

                {loadingResults && (
                  <View style={styles.centered}>
                    <ActivityIndicator
                      color={colors.red}
                      size="large"
                      accessibilityLabel={t("common.loading")}
                    />
                  </View>
                )}

                {!loadingResults && !isError && totalMatches === 0 && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>{t("details.empty")}</Text>
                  </View>
                )}

                {/* Tournament rounds */}
                {!loadingResults && !isError && rounds.length > 0 && (
                  <>
                    <View style={styles.tournamentHeader}>
                      <Text style={styles.tournamentEyebrow}>{t("details.tableau_eyebrow")}</Text>
                      <Text style={styles.tournamentTitle} accessibilityRole="header">
                        {t("details.tournament_title")}
                      </Text>
                      <Text style={styles.tournamentSub}>
                        {t("details.rounds_count", { count: rounds.length })}
                      </Text>
                      <StatsStrip
                        total={totalMatches}
                        played={playedMatches}
                        pending={pendingMatches}
                      />
                    </View>

                    {viewMode === "bracket"
                      ? (
                        <View style={[styles.bracketWrapper, { width: screenWidth }]}>
                          <BracketView rounds={rounds} />
                        </View>
                      )
                      : rounds.map((round) => (
                        <View key={round.type} style={styles.roundSection}>
                          <RoundHeader type={round.type} count={round.results.length} />
                          <View style={styles.matchList}>
                            {round.results.map((r) => (
                              <MatchCard key={r.id} result={r} phaseType={round.type} />
                            ))}
                          </View>
                        </View>
                      ))}
                  </>
                )}
              </>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120 },
    body: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },

    // Context badges
    badgeRow: { flexDirection: "row", gap: 8 },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: c.white,
    },
    badgeText: { color: c.red, fontSize: 13, fontWeight: "800" },

    // States
    centered: { paddingVertical: 40, alignItems: "center" },
    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorText: { color: c.red, fontSize: 14, fontWeight: "600" },
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

    // Tournament header
    tournamentHeader: { gap: 4 },
    tournamentEyebrow: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    tournamentTitle: { color: c.ink, fontSize: 28, fontWeight: "800" },
    tournamentSub: { color: c.muted, fontSize: 13 },

    // Stats strip
    statsStrip: {
      flexDirection: "row",
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
      marginTop: 12,
    },
    statCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
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
    },
    statDivider: {
      width: 1,
      backgroundColor: c.line,
      marginVertical: 12,
    },

    // View toggle
    toggleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    togglePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 9999,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
    },
    togglePillActive: {
      backgroundColor: c.redFill,
      borderColor: c.redFill,
    },
    togglePillLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: c.muted,
    },
    togglePillLabelActive: {
      color: "#FFFFFF",
    },

    bracketWrapper: {
      marginLeft: -20,
    },

    // Round section
    roundSection: { gap: 10 },

    // Round divider
    roundDivider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginVertical: 4,
    },
    roundDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.line,
      borderRadius: 1,
    },
    roundDividerPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    roundDividerLabel: {
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    roundDividerCount: {
      fontSize: 12,
      fontWeight: "600",
    },

    // Match list
    matchList: { gap: 8 },

    // Match card
    matchCard: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    matchCardPending: { backgroundColor: c.card },
    matchHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 26,
      paddingHorizontal: 14,
      paddingTop: 10,
    },
    matchHeaderText: { color: c.muted, fontSize: 12, fontWeight: "600" },
    matchPhase: { flexShrink: 1 },
    matchCardInner: { paddingHorizontal: 14, paddingTop: 2, paddingBottom: 6 },
  });
