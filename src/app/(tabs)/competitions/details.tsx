import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock3, Swords, Trophy } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";
import { useCompetition } from "@/hooks/use-competitions";
import { useResultsByCompetition } from "@/hooks/use-matches";
import { Temporal } from "@js-temporal/polyfill";

import type { Result } from "@/types/competition";

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

function formatLineup(lineup?: { player1?: { name: string }; player2?: { name: string } }): string {
  if (!lineup) return "";
  return [lineup.player1?.name, lineup.player2?.name].filter(Boolean).join(" / ");
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

function ResultCard({ result }: { result: Result }) {
  const hasScore = result.scoreA != null && result.scoreB != null;
  const lineupA = formatLineup(result.clubALineup);
  const lineupB = formatLineup(result.clubBLineup);
  const stageMeta = [result.specialty?.name, result.phase].filter(Boolean).join(" · ");
  const pillLabel = formatDate(result.dateMatch);
  const pillTone = dateTone(result.dateMatch);

  if (hasScore) {
    return (
      <View style={styles.resultCard} testID={`result-card-${result.id}`}>
        <View style={styles.rowBetween}>
          <View style={styles.resultMain}>
            <Text style={styles.resultScore}>
              {result.scoreA} — {result.scoreB}
            </Text>
            <Text style={styles.resultPlayers}>
              {lineupA || result.clubA.name} vs {lineupB || result.clubB.name}
            </Text>
          </View>
          <StatusPill label={pillLabel} tone={pillTone} />
        </View>
        {stageMeta ? <Text style={styles.metaText}>{stageMeta}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.card} testID={`result-card-${result.id}`}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{lineupA || result.clubA.name}</Text>
        <StatusPill label={pillLabel} tone={pillTone} />
      </View>
      <Text style={styles.cardSubtitle}>{lineupB || result.clubB.name}</Text>
      <View style={styles.metaRow}>
        {result.dateMatch && (
          <View style={styles.metaItem}>
            <Clock3 color={KanchaColors.muted} size={14} />
            <Text style={styles.metaText}>{formatDate(result.dateMatch)}</Text>
          </View>
        )}
        {stageMeta
          ? (
            <View style={styles.metaItem}>
              <Swords color={KanchaColors.muted} size={14} />
              <Text style={styles.metaText}>{stageMeta}</Text>
            </View>
          )
          : null}
      </View>
    </View>
  );
}

export default function CompetitionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: competition, isPending: loadingComp } = useCompetition(id ?? "");
  const {
    data: results,
    isPending: loadingResults,
    isError,
    error,
  } = useResultsByCompetition(id ?? "");

  const sortedResults = results
    ? [...results].sort((a, b) => {
      if (!a.dateMatch) return 1;
      if (!b.dateMatch) return -1;
      const da = parsePlainDate(a.dateMatch);
      const db = parsePlainDate(b.dateMatch);
      if (!da) return 1;
      if (!db) return -1;
      return Temporal.PlainDate.compare(da, db);
    })
    : [];

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FlatList
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="competition-details-screen"
          ListHeaderComponent={
            <>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft color={KanchaColors.white} size={20} />
                <Text style={styles.backLabel}>Competitions</Text>
              </Pressable>

              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Trophy color={KanchaColors.white} size={20} />
                </View>
                {loadingComp ? <ActivityIndicator color={KanchaColors.white} /> : (
                  <>
                    <Text style={styles.heroTitle}>
                      {competition?.name ?? "Competition"}
                    </Text>
                    {(competition?.year != null || competition?.level) && (
                      <Text style={styles.heroMeta}>
                        {[competition?.year, competition?.level].filter(Boolean).join(" · ")}
                      </Text>
                    )}
                  </>
                )}
              </View>

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

              {!loadingResults && !isError && sortedResults.length > 0 && (
                <SectionHeader
                  eyebrow="Results"
                  title="All matches"
                  subtitle={`${sortedResults.length} match${
                    sortedResults.length > 1 ? "es" : ""
                  }, sorted by date`}
                />
              )}

              {!loadingResults && !isError && sortedResults.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No results found for this competition.</Text>
                </View>
              )}
            </>
          }
          data={loadingResults ? [] : sortedResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ResultCard result={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 22,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  backLabel: {
    color: KanchaColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
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
  separator: { height: 12 },
  // — completed result (mirrors matches screen resultCard) —
  resultCard: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  resultMain: { gap: 4 },
  resultScore: { color: KanchaColors.red, fontSize: 28, fontWeight: "900" },
  resultPlayers: { color: KanchaColors.ink, fontSize: 15, fontWeight: "700" },
  // — scheduled result (mirrors matches screen card) —
  card: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { flex: 1, color: KanchaColors.ink, fontSize: 17, fontWeight: "800" },
  cardSubtitle: { color: "#625A52", fontSize: 15, fontWeight: "600" },
  metaRow: { gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: KanchaColors.muted, fontSize: 13 },
});
