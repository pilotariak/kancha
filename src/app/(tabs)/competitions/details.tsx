import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BracketView, RoundGroup, TeamRows, usePhaseColors } from "@/components/BracketView";
import { CardGrid } from "@/components/CardGrid";
import { FilterChips } from "@/components/FilterChips";
import { LayoutList, ListOrdered, Network, Swords, Trophy, Users } from "@/components/icons";
import { RankingView } from "@/components/RankingView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { type Segment, SegmentedControl } from "@/components/SegmentedControl";
import { SelectField } from "@/components/SelectField";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { dateTone, formatMatchDate } from "@/features/competitions/matchDate";
import { matchPhaseLabel, parsePhase } from "@/features/competitions/matchPhase";
import { matchProgress } from "@/features/competitions/matchProgress";
import { parseMatchScore } from "@/features/competitions/matchScore";
import {
  buildFilterOptions,
  resolveSelection,
  withSelected,
} from "@/features/competitions/resultFilters";
import { GRID_GAP } from "@/features/layout/breakpoints";
import { useCategories } from "@/hooks/use-categories";
import { useCompetition, useResultFilters } from "@/hooks/use-competitions";
import { useWebLayout } from "@/hooks/use-layout";
import { useResultsByCompetition } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { useLeagueStore } from "@/store/league-store";
import {
  selectionKey,
  useResultsFilterHydrated,
  useResultsFilterStore,
} from "@/store/results-filter-store";

import type { PhaseColors, PhaseType } from "@/components/BracketView";
import type { Result } from "@/types/competition";

// ─── Grouping ─────────────────────────────────────────────────────────────────

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

function MatchCard(
  { result, phaseType, fill = false }: {
    result: Result;
    phaseType: PhaseType;
    /** Fills its grid cell, so the two cards of a row share its height. */
    fill?: boolean;
  },
) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const hasScore = parseMatchScore(result.scores) != null;
  const phaseLabel = matchPhaseLabel(result.phase, t);
  // The language the strings resolved to, so a "de" device gets an English date too.
  const dateLabel = formatMatchDate(result.dateMatch, i18n.resolvedLanguage ?? "en");
  const todayTone = dateTone(result.dateMatch);
  const colors: PhaseColors = usePhaseColors()[phaseType];
  const isFinal = phaseType === "F";

  const cardStyle = [
    styles.matchCard,
    !hasScore && styles.matchCardPending,
    fill && styles.matchCardFill,
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

// ─── Progress ─────────────────────────────────────────────────────────────────

function ResultsProgress({ results }: { results: Result[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const { played, total, finished } = matchProgress(results);

  return (
    <View style={styles.progress} testID="results-progress">
      <Text style={styles.progressLabel}>{t("details.progress", { played, count: total })}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(played / total) * 100}%` }]} />
      </View>
      {finished ? <StatusPill label={t("details.finished")} tone="dark" /> : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type ViewMode = "list" | "bracket" | "ranking";

export default function CompetitionDetailsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{
    id: string;
    specialtyId?: string;
    categoryId?: string;
  }>();
  const id = params.id ?? "";
  const { specialtyId, categoryId } = params;

  const { columns, cellWidth, contentWidth } = useWebLayout();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  // Wider than a phone (web), the results use the grid. From three columns, the filters take
  // the first one and stay in view; with two, and always for the bracket, they sit in a bar
  // above the results, which then get every column.
  const grid = columns > 1;
  const filterColumn = columns > 2 && viewMode !== "bracket";
  const filterBar = grid && !filterColumn;
  const resultColumns = filterColumn ? columns - 1 : columns;

  const leagueId = useLeagueStore((s) => s.selectedLeagueId);
  const league = LEAGUES.find((l) => l.id === leagueId);
  const storeKey = selectionKey(leagueId, id);
  const lastViewed = useResultsFilterStore((s) => s.selections[storeKey]);
  const remember = useResultsFilterStore((s) => s.remember);
  const storeReady = useResultsFilterHydrated();

  const { data: competition, isPending: loadingComp } = useCompetition(id);
  const { data: specialties } = useSpecialties();
  const { data: categories } = useCategories();
  const { data: pairs, isError: isPairsError, error: pairsError } = useResultFilters(id);
  const options = useMemo(
    () =>
      pairs && specialties && categories
        ? buildFilterOptions(pairs, specialties, categories)
        : null,
    [pairs, specialties, categories],
  );
  // Undefined until the options and the saved pairs load; null when the
  // competition has no results to pick from.
  const selection = storeReady && options
    ? resolveSelection(options, { specialtyId, categoryId }, lastViewed)
    : undefined;
  const nextSpecialtyId = selection?.specialtyId;
  const nextCategoryId = selection?.categoryId;

  // Write the pair on screen to the URL, so a reload or a shared link shows it too.
  useEffect(() => {
    if (!nextSpecialtyId || !nextCategoryId) return;
    if (nextSpecialtyId !== specialtyId || nextCategoryId !== categoryId) {
      router.setParams({ specialtyId: nextSpecialtyId, categoryId: nextCategoryId });
    }
  }, [nextSpecialtyId, nextCategoryId, specialtyId, categoryId]);

  useEffect(() => {
    if (storeReady && id && specialtyId && categoryId) {
      remember(storeKey, { specialtyId, categoryId });
    }
  }, [storeReady, id, specialtyId, categoryId, storeKey, remember]);

  const {
    data: results,
    isPending: loadingResults,
    isError,
    error,
  } = useResultsByCompetition(id, specialtyId, categoryId);

  const hasPair = !!specialtyId && !!categoryId;
  const rounds = results ? groupByRound(results) : [];
  const specialtyOptions = withSelected(options?.specialties ?? [], specialtyId, specialties);
  const categoryOptions = withSelected(
    (specialtyId && options?.categories[specialtyId]) || [],
    categoryId,
    categories,
  );

  const segments: Segment<ViewMode>[] = [
    { value: "list", label: t("details.view_list"), icon: LayoutList },
    { value: "bracket", label: t("details.view_bracket"), icon: Network },
    { value: "ranking", label: t("details.view_ranking"), icon: ListOrdered },
  ];

  function selectSpecialty(next: string) {
    if (!options) return;
    // Keep the category when the new specialty has results in it.
    const pair = resolveSelection(options, { specialtyId: next }, {
      specialtyId: next,
      categoryId: categoryId ?? "",
    });
    router.setParams(pair ? { ...pair } : { specialtyId: next });
  }

  // Back to the list: pops to it when it is under this screen, and replaces this
  // screen with it after a deep link or a reload, where the stack holds the leagues.
  const goBack = () => router.dismissTo("/(tabs)/competitions/list");

  const spinner = (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.red} size="large" accessibilityLabel={t("common.loading")} />
    </View>
  );
  const empty = (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>{t("details.empty")}</Text>
    </View>
  );
  const errorBox = (e: unknown) => (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Text style={styles.errorText}>
        {e instanceof Error ? e.message : t("details.error_load")}
      </Text>
    </View>
  );

  // The matches of the list and bracket views, once loaded. In the grid, their progress moves
  // to the filters.
  const listed = hasPair && viewMode !== "ranking" && !isError && !loadingResults
      && results && results.length > 0
    ? results
    : null;

  // On a phone, the bracket scrolls sideways and bleeds over the gutter to the screen's edges.
  const bracket = grid
    ? <BracketView rounds={rounds} columns={columns} />
    : (
      <View style={[styles.bracketWrapper, { width: contentWidth }]}>
        <BracketView rounds={rounds} />
      </View>
    );

  // In the filter bar, each filter gets its own width; elsewhere they stack.
  const barItem = (style: StyleProp<ViewStyle>, node: React.ReactNode) =>
    filterBar ? <View style={style}>{node}</View> : node;
  const cell = { width: cellWidth };

  function renderResults() {
    if (isPairsError && !hasPair) return errorBox(pairsError);
    if (selection === null && !hasPair) return empty;
    if (!hasPair) return spinner;
    if (viewMode === "ranking") {
      return (
        <RankingView
          competitionId={id}
          specialtyId={specialtyId}
          categoryId={categoryId}
          columns={resultColumns}
        />
      );
    }
    if (isError) return errorBox(error);
    if (loadingResults) return spinner;
    if (!listed) return empty;
    return (
      <>
        {grid ? null : <ResultsProgress results={listed} />}
        {viewMode === "bracket"
          ? bracket
          : rounds.map((round) => (
            <View key={round.type} style={styles.roundSection}>
              <RoundHeader type={round.type} count={round.results.length} />
              <CardGrid columns={resultColumns} style={styles.matchList}>
                {round.results.map((r) => (
                  <MatchCard key={r.id} result={r} phaseType={round.type} fill={grid} />
                ))}
              </CardGrid>
            </View>
          ))}
      </>
    );
  }

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
          onBack={goBack}
          eyebrow={league?.name}
          title={competition?.name ?? t("common.competition_fallback")}
          loading={loadingComp}
          compact
        />

        <View style={[styles.body, filterColumn && styles.bodyFilterColumn]}>
          <View
            style={[
              styles.filters,
              filterColumn && [styles.filterColumn, cell],
              filterBar && styles.filterBar,
            ]}
          >
            {specialtyOptions.length > 0 && barItem(
              cell,
              <SelectField
                label={t("specialty.title")}
                hint={t("details.specialty_hint")}
                options={specialtyOptions}
                value={specialtyId}
                onChange={selectSpecialty}
                testID="specialty-select"
              />,
            )}
            {categoryOptions.length > 0 && barItem(
              styles.barChips,
              <FilterChips
                accessibilityLabel={t("category.title")}
                options={categoryOptions}
                value={categoryId}
                onChange={(next) => router.setParams({ categoryId: next })}
                wrap={grid}
                testID="category-chips"
              />,
            )}
            {barItem(
              cell,
              <SegmentedControl
                segments={segments}
                value={viewMode}
                onChange={setViewMode}
                testID="view-mode"
              />,
            )}
            {grid && listed ? barItem(styles.barFull, <ResultsProgress results={listed} />) : null}
          </View>

          {filterColumn
            ? <View style={styles.resultsBesideFilters}>{renderResults()}</View>
            : renderResults()}
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
    body: { paddingHorizontal: 20, paddingTop: 14, gap: 12 },
    filters: { gap: 10 },

    // Three grid columns or more: the filters take the first one, one cell wide, and stay in
    // view while the matches scroll.
    bodyFilterColumn: { flexDirection: "row", alignItems: "flex-start", gap: GRID_GAP },
    filterColumn: {
      // Web only, and missing from React Native's position type.
      position: "sticky" as ViewStyle["position"],
      top: 16,
    },
    resultsBesideFilters: { flex: 1, minWidth: 0, gap: 12 },
    // Two columns, and the bracket: the filters on a line above the results (two when the
    // window is narrow), the progress on the next. The field and the segments are a cell wide.
    filterBar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: GRID_GAP },
    barChips: { flexGrow: 1, flexBasis: 200 },
    barFull: { width: "100%" },

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

    // Progress
    progress: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 26 },
    progressLabel: {
      color: c.text,
      fontSize: 13,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    progressTrack: {
      flex: 1,
      height: 6,
      borderRadius: 9999,
      backgroundColor: c.line,
      overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 9999, backgroundColor: c.ink },

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
    matchCardFill: { flex: 1 },
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
