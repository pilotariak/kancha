import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Swords, Trophy, Users } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { useCategories } from "@/hooks/use-categories";
import { useCompetition } from "@/hooks/use-competitions";
import { useResultsByCompetition } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { Temporal } from "@js-temporal/polyfill";

import type { Result } from "@/types/competition";

// ─── Score parsing ────────────────────────────────────────────────────────────

/**
 * Parse the `scores` field (e.g. "15/10 15/13") into per-team display strings.
 * Each space-separated token is one set in "A/B" format.
 * Returns the per-set scores joined by "–" for each team, or null when absent.
 */
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

// ─── Phase parsing ────────────────────────────────────────────────────────────

type PhaseType = "P" | "B1T" | "B2T" | "B3T" | "H" | "Q" | "D" | "F" | "other";

interface ParsedPhase {
  type: PhaseType;
  number: number;
}

function parsePhase(phase?: string): ParsedPhase {
  if (!phase) return { type: "other", number: 0 };
  // Match B1T/B2T/B3T first (longer pattern), then single letters P/Q/D/F/H
  const m = phase.match(/(B[123]T|[PQDFH])\s*(\d+)\s*$/);
  if (!m) return { type: "other", number: 0 };
  return { type: m[1] as PhaseType, number: parseInt(m[2], 10) };
}

const ROUND_ORDER: Record<PhaseType, number> = {
  P: 0,
  B1T: 1,
  B2T: 2,
  B3T: 3,
  H: 4,
  Q: 5,
  D: 6,
  F: 7,
  other: 8,
};

interface PhaseColors {
  pill: string; // pill background
  border: string; // pill border
  label: string; // text color
  count: string; // count badge color
  icon: string; // icon color
  cardBorder: string; // match card border
}

const PHASE_COLORS: Record<PhaseType, PhaseColors> = {
  P: {
    pill: "#EBF3FF",
    border: "rgba(37,99,235,0.3)",
    label: "#1D4ED8",
    count: "#2563EB",
    icon: "#2563EB",
    cardBorder: "rgba(37,99,235,0.25)",
  },
  B1T: {
    pill: "#ECFDF5",
    border: "rgba(5,150,105,0.3)",
    label: "#047857",
    count: "#059669",
    icon: "#059669",
    cardBorder: "rgba(5,150,105,0.25)",
  },
  B2T: {
    pill: "#F0FDF4",
    border: "rgba(22,163,74,0.3)",
    label: "#15803D",
    count: "#16A34A",
    icon: "#16A34A",
    cardBorder: "rgba(22,163,74,0.25)",
  },
  B3T: {
    pill: "#F7FEE7",
    border: "rgba(101,163,13,0.3)",
    label: "#4D7C0F",
    count: "#65A30D",
    icon: "#65A30D",
    cardBorder: "rgba(101,163,13,0.25)",
  },
  H: {
    pill: "#F3EEFF",
    border: "rgba(124,58,237,0.3)",
    label: "#6D28D9",
    count: "#7C3AED",
    icon: "#7C3AED",
    cardBorder: "rgba(124,58,237,0.25)",
  },
  Q: {
    pill: "#E6FAF8",
    border: "rgba(8,145,178,0.3)",
    label: "#0E7490",
    count: "#0891B2",
    icon: "#0891B2",
    cardBorder: "rgba(8,145,178,0.25)",
  },
  D: {
    pill: "#FFF3E6",
    border: "rgba(234,88,12,0.3)",
    label: "#C2410C",
    count: "#EA580C",
    icon: "#EA580C",
    cardBorder: "rgba(234,88,12,0.25)",
  },
  F: {
    pill: "#FFF8E7",
    border: "rgba(200,144,10,0.4)",
    label: "#A86E00",
    count: "#C8900A",
    icon: "#C8900A",
    cardBorder: KanchaColors.red,
  },
  other: {
    pill: KanchaColors.cream,
    border: KanchaColors.line,
    label: KanchaColors.ink,
    count: KanchaColors.muted,
    icon: KanchaColors.ink,
    cardBorder: KanchaColors.line,
  },
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

interface RoundGroup {
  type: PhaseType;
  results: Result[];
}

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

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parsePlainDate(dateStr: string): Temporal.PlainDate | null {
  const [d, m, y] = dateStr.split("/");
  if (!d || !m || !y) return null;
  try {
    return Temporal.PlainDate.from({ year: Number(y), month: Number(m), day: Number(d) });
  } catch {
    return null;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return dateStr;
}

function dateTone(dateStr?: string): "red" | "green" | "dark" {
  if (!dateStr) return "dark";
  const date = parsePlainDate(dateStr);
  if (!date) return "dark";
  const today = Temporal.Now.plainDateISO();
  const cmp = Temporal.PlainDate.compare(date, today);
  if (cmp < 0) return "red";
  if (cmp > 0) return "dark";
  return "green";
}

function formatLineup(lineup?: { player1?: { name: string }; player2?: { name: string } }): string {
  if (!lineup) return "";
  return [lineup.player1?.name, lineup.player2?.name].filter(Boolean).join(" / ");
}

// ─── Round header ─────────────────────────────────────────────────────────────

function RoundHeader({ type, count }: { type: PhaseType; count: number }) {
  const { t } = useTranslation();
  const colors = PHASE_COLORS[type];
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
  const { scoreA, scoreB } = parseScores(result.scores);
  const hasScore = scoreA != null && scoreB != null;
  const lineupA = formatLineup(result.clubALineup);
  const lineupB = formatLineup(result.clubBLineup);
  const pillLabel = formatDate(result.dateMatch);
  const pillTone = dateTone(result.dateMatch);
  const phaseLabel = result.phase ?? "";
  const colors = PHASE_COLORS[phaseType];
  const isFinal = phaseType === "F";

  const cardStyle = [
    styles.matchCard,
    !hasScore && styles.matchCardPending,
    { borderColor: colors.cardBorder, borderWidth: isFinal ? 2 : 1 },
  ];

  return (
    <View style={cardStyle} testID={`result-card-${result.id}`}>
      <View style={styles.matchCardInner}>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, isFinal && styles.teamNameFinal]} numberOfLines={1}>
            {lineupA || result.clubA.name}
          </Text>
          {hasScore
            ? <Text style={[styles.score, isFinal && styles.scoreFinal]}>{scoreA}</Text>
            : <Text style={styles.scorePending}>—</Text>}
        </View>
        <View style={styles.divider} />
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, isFinal && styles.teamNameFinal]} numberOfLines={1}>
            {lineupB || result.clubB.name}
          </Text>
          {hasScore
            ? <Text style={[styles.score, isFinal && styles.scoreFinal]}>{scoreB}</Text>
            : <Text style={styles.scorePending}>—</Text>}
        </View>
      </View>
      <View style={styles.matchMeta}>
        <StatusPill label={pillLabel} tone={pillTone} />
        {phaseLabel
          ? <Text style={[styles.phaseChip, { color: colors.label }]}>{phaseLabel}</Text>
          : null}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompetitionDetailsScreen() {
  const { t } = useTranslation();
  const { id, specialtyId, categoryId } = useLocalSearchParams<{
    id: string;
    specialtyId: string;
    categoryId: string;
  }>();

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

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="competition-details-screen"
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={KanchaColors.white} size={20} />
            <Text style={styles.backLabel}>{t("details.back")}</Text>
          </Pressable>

          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Trophy color={KanchaColors.white} size={20} />
            </View>
            {loadingComp
              ? <ActivityIndicator color={KanchaColors.white} />
              : (
                <>
                  <Text style={styles.heroTitle}>
                    {competition?.name ?? t("common.competition_fallback")}
                  </Text>
                  {(competition?.year != null || competition?.level) && (
                    <Text style={styles.heroMeta}>
                      {[competition?.year, competition?.level].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </>
              )}
          </View>

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

          {/* States */}
          {isError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : t("details.error_load")}
              </Text>
            </View>
          )}

          {loadingResults && (
            <View style={styles.centered}>
              <ActivityIndicator color={KanchaColors.white} size="large" />
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
                <Text style={styles.tournamentTitle}>{t("details.tournament_title")}</Text>
                <Text style={styles.tournamentSub}>
                  {t("details.matches_count", { count: totalMatches })}
                  {" · "}
                  {t("details.rounds_count", { count: rounds.length })}
                </Text>
              </View>

              {rounds.map((round) => (
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
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  backLabel: { color: KanchaColors.white, fontSize: 15, fontWeight: "600" },

  // Hero
  heroCard: {
    borderRadius: 24,
    backgroundColor: KanchaColors.red,
    padding: 22,
    gap: 10,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: KanchaColors.white, fontSize: 28, fontWeight: "900" },
  heroMeta: { color: "rgba(255,255,255,0.78)", fontSize: 14, fontWeight: "600" },

  // Context badges
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: KanchaColors.white,
  },
  badgeText: { color: KanchaColors.red, fontSize: 13, fontWeight: "800" },

  // States
  centered: { paddingVertical: 40, alignItems: "center" },
  errorBox: {
    borderRadius: 16,
    backgroundColor: KanchaColors.redSoft,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(200,16,46,0.2)",
  },
  errorText: { color: KanchaColors.redDark, fontSize: 14, fontWeight: "600" },
  emptyBox: {
    borderRadius: 16,
    backgroundColor: KanchaColors.white,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: KanchaColors.line,
  },
  emptyText: {
    color: KanchaColors.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  // Tournament header — rendered over cream, so use dark ink tones
  tournamentHeader: { gap: 4 },
  tournamentEyebrow: {
    color: KanchaColors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  tournamentTitle: { color: KanchaColors.ink, fontSize: 28, fontWeight: "900" },
  tournamentSub: { color: KanchaColors.muted, fontSize: 13 },

  // Round section
  roundSection: { gap: 10 },

  // Round divider title — cream background, use line/ink colors
  roundDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  roundDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: KanchaColors.line,
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
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    overflow: "hidden",
  },
  matchCardPending: { backgroundColor: KanchaColors.card },
  matchCardInner: { padding: 14, gap: 0 },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },
  teamName: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  teamNameFinal: { fontSize: 16, fontWeight: "800" },
  score: {
    color: KanchaColors.red,
    fontSize: 22,
    fontWeight: "900",
    minWidth: 28,
    textAlign: "right",
  },
  scoreFinal: { fontSize: 28 },
  scorePending: {
    color: KanchaColors.muted,
    fontSize: 20,
    fontWeight: "300",
    minWidth: 28,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: KanchaColors.line,
  },
  matchMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: KanchaColors.line,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  phaseChip: {
    color: KanchaColors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
});
