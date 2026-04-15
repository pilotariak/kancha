import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Swords, Trophy, Users } from "lucide-react-native";
import React from "react";
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

// ─── Phase parsing ────────────────────────────────────────────────────────────

type PhaseType = "P" | "Q" | "D" | "F" | "other";

interface ParsedPhase {
  type: PhaseType;
  number: number;
}

function parsePhase(phase?: string): ParsedPhase {
  if (!phase) return { type: "other", number: 0 };
  // Match the type letter and number at the end, e.g. "GROUPE A - P 4" → P, 4
  const m = phase.match(/([PQDF])\s*(\d+)\s*$/);
  if (!m) return { type: "other", number: 0 };
  return { type: m[1] as PhaseType, number: parseInt(m[2], 10) };
}

const ROUND_ORDER: Record<PhaseType, number> = { P: 0, Q: 1, D: 2, F: 3, other: 4 };

function roundLabel(type: PhaseType): string {
  switch (type) {
    case "P":
      return "Poules";
    case "Q":
      return "Quarts de finale";
    case "D":
      return "Demi-finales";
    case "F":
      return "Finale";
    default:
      return "Matchs";
  }
}

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
  const isFinal = type === "F";
  const Icon = type === "P" ? Users : type === "F" ? Trophy : Swords;
  const iconColor = isFinal ? "#C8900A" : KanchaColors.white;

  return (
    <View style={styles.roundDivider}>
      <View style={styles.roundDividerLine} />
      <View style={[styles.roundDividerPill, isFinal && styles.roundDividerPillFinal]}>
        <Icon color={iconColor} size={13} />
        <Text style={[styles.roundDividerLabel, isFinal && styles.roundDividerLabelFinal]}>
          {roundLabel(type)}
        </Text>
        <Text style={[styles.roundDividerCount, isFinal && styles.roundDividerCountFinal]}>
          {count}
        </Text>
      </View>
      <View style={styles.roundDividerLine} />
    </View>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ result, isFinal }: { result: Result; isFinal?: boolean }) {
  const hasScore = result.scoreA != null && result.scoreB != null;
  const lineupA = formatLineup(result.clubALineup);
  const lineupB = formatLineup(result.clubBLineup);
  const pillLabel = formatDate(result.dateMatch);
  const pillTone = dateTone(result.dateMatch);
  const phaseLabel = result.phase ?? "";

  if (hasScore) {
    return (
      <View
        style={[styles.matchCard, isFinal && styles.matchCardFinal]}
        testID={`result-card-${result.id}`}
      >
        <View style={styles.matchCardInner}>
          <View style={styles.teamRow}>
            <Text
              style={[styles.teamName, isFinal && styles.teamNameFinal]}
              numberOfLines={1}
            >
              {lineupA || result.clubA.name}
            </Text>
            <Text style={[styles.score, isFinal && styles.scoreFinal]}>
              {result.scoreA}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.teamRow}>
            <Text
              style={[styles.teamName, isFinal && styles.teamNameFinal]}
              numberOfLines={1}
            >
              {lineupB || result.clubB.name}
            </Text>
            <Text style={[styles.score, isFinal && styles.scoreFinal]}>
              {result.scoreB}
            </Text>
          </View>
        </View>
        <View style={styles.matchMeta}>
          <StatusPill label={pillLabel} tone={pillTone} />
          {phaseLabel ? <Text style={styles.phaseChip}>{phaseLabel}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.matchCard, styles.matchCardPending, isFinal && styles.matchCardFinal]}
      testID={`result-card-${result.id}`}
    >
      <View style={styles.matchCardInner}>
        <View style={styles.teamRow}>
          <Text
            style={[styles.teamName, isFinal && styles.teamNameFinal]}
            numberOfLines={1}
          >
            {lineupA || result.clubA.name}
          </Text>
          <Text style={styles.scorePending}>—</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.teamRow}>
          <Text
            style={[styles.teamName, isFinal && styles.teamNameFinal]}
            numberOfLines={1}
          >
            {lineupB || result.clubB.name}
          </Text>
          <Text style={styles.scorePending}>—</Text>
        </View>
      </View>
      <View style={styles.matchMeta}>
        <StatusPill label={pillLabel} tone={pillTone} />
        {phaseLabel ? <Text style={styles.phaseChip}>{phaseLabel}</Text> : null}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompetitionDetailsScreen() {
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
            <Text style={styles.backLabel}>Category</Text>
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
                  <Text style={styles.heroTitle}>{competition?.name ?? "Competition"}</Text>
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
                {error instanceof Error ? error.message : "Failed to load results"}
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
              <Text style={styles.emptyText}>No results found for this competition.</Text>
            </View>
          )}

          {/* Tournament rounds */}
          {!loadingResults && !isError && rounds.length > 0 && (
            <>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentEyebrow}>Tableau</Text>
                <Text style={styles.tournamentTitle}>Tournoi</Text>
                <Text style={styles.tournamentSub}>
                  {totalMatches} match{totalMatches > 1 ? "s" : ""} · {rounds.length}{" "}
                  tour{rounds.length > 1 ? "s" : ""}
                </Text>
              </View>

              {rounds.map((round) => (
                <View key={round.type} style={styles.roundSection}>
                  <RoundHeader type={round.type} count={round.results.length} />
                  <View style={styles.matchList}>
                    {round.results.map((r) => (
                      <MatchCard key={r.id} result={r} isFinal={round.type === "F"} />
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
    backgroundColor: "rgba(255,60,60,0.15)",
    padding: 16,
  },
  errorText: { color: KanchaColors.white, fontSize: 14, fontWeight: "600" },
  emptyBox: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  // Tournament header
  tournamentHeader: { gap: 4 },
  tournamentEyebrow: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  tournamentTitle: { color: KanchaColors.white, fontSize: 28, fontWeight: "900" },
  tournamentSub: { color: "rgba(255,255,255,0.72)", fontSize: 13 },

  // Round section
  roundSection: { gap: 10 },

  // Round divider title
  roundDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  roundDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 1,
  },
  roundDividerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  roundDividerPillFinal: {
    backgroundColor: "rgba(200,144,10,0.18)",
    borderColor: "rgba(200,144,10,0.45)",
  },
  roundDividerLabel: {
    color: KanchaColors.white,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  roundDividerLabelFinal: { color: "#C8900A" },
  roundDividerCount: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  roundDividerCountFinal: { color: "rgba(200,144,10,0.7)" },

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
  matchCardFinal: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: KanchaColors.red,
  },
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
