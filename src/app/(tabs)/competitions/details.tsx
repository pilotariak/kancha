import { router, Stack, useLocalSearchParams } from "expo-router";
import React, {
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Platform,
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
import { BAR_HEIGHT, ScreenHeader } from "@/components/ScreenHeader";
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
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

// ─── Pinned header ────────────────────────────────────────────────────────────

/**
 * Scroll distance over which the collapsed bar fades in, ending when it pins: its fill over the
 * first half, hiding the band's title, then its arrow and title.
 */
const BAR_FADE = 24;

/**
 * What stays at the top while the results scroll: the collapsed bar, then `children` on cream
 * (the filters on a phone and in the filter bar). Anything else that should stay in view, below
 * the filters, goes in `children` too. Its top `BAR_HEIGHT` overlaps the band's bottom, so the
 * bar, invisible at rest, fades in over the band and pins as the band leaves. `opacity` is the
 * bar's fill; the bar's own `contentOpacity` follows it.
 */
function PinnedHeader(
  { bar, opacity, children }: {
    /** The `collapsed` ScreenHeader. */
    bar: ReactElement;
    opacity: Animated.AnimatedInterpolation<number> | number;
    children?: ReactNode;
  },
) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <Animated.View style={[styles.barUnderlay, { opacity }]}>{bar}</Animated.View>
      {children
        ? (
          <View style={styles.pinnedBody}>
            {children}
            <Animated.View style={[styles.pinnedEdge, { opacity }]} />
          </View>
        )
        : null}
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

  // The band scrolls away; the collapsed bar pins in its place when the band's bottom reaches
  // it, at `collapseAt`. Until the band is measured (and in the static web HTML) the bar stays
  // hidden. With reduce motion on, it shows at once, halfway, instead of fading in.
  const reduceMotion = useReducedMotion();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bandHeight, setBandHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const collapseAt = bandHeight - BAR_HEIGHT;
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: Platform.OS !== "web",
      }),
    [scrollY],
  );
  useEffect(() => {
    if (!bandHeight) return;
    // Halfway through the fade, as its arrow appears: from there the bar takes touches, focus
    // and screen readers.
    const id = scrollY.addListener(({ value }) => setCollapsed(value >= collapseAt - BAR_FADE / 2));
    return () => scrollY.removeListener(id);
  }, [scrollY, bandHeight, collapseAt]);
  const [fillFade, contentFade] = useMemo(
    () =>
      [collapseAt - BAR_FADE, collapseAt - BAR_FADE / 2].map((start) =>
        scrollY.interpolate({
          inputRange: [start, start + BAR_FADE / 2],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      ),
    [scrollY, collapseAt],
  );
  const shown = collapsed ? 1 : 0;
  const barOpacity = !bandHeight ? 0 : reduceMotion ? shown : fillFade;
  const barContentOpacity = reduceMotion ? shown : contentFade;

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

  const cell = { width: cellWidth };
  const select = specialtyOptions.length > 0
    ? (
      <SelectField
        label={t("specialty.title")}
        hint={t("details.specialty_hint")}
        options={specialtyOptions}
        value={specialtyId}
        onChange={selectSpecialty}
        testID="specialty-select"
      />
    )
    : null;
  const chips = categoryOptions.length > 0
    ? (
      <FilterChips
        accessibilityLabel={t("category.title")}
        options={categoryOptions}
        value={categoryId}
        onChange={(next) => router.setParams({ categoryId: next })}
        wrap={grid}
        bleed="start"
        testID="category-chips"
      />
    )
    : null;
  const viewSwitch = (
    <SegmentedControl
      segments={segments}
      value={viewMode}
      onChange={setViewMode}
      iconOnly={!grid}
      testID="view-mode"
    />
  );

  // The filters pinned under the bar: two rows on a phone (the select, then the chips and an
  // icon-only view switch), the filter bar in the grid. The filter column is not pinned: it is
  // sticky beside the results, under the bar.
  let pinnedFilters: ReactNode = null;
  if (!grid) {
    pinnedFilters = (
      <View style={styles.filters}>
        {select}
        <View style={styles.chipsRow}>
          <View style={styles.chipsRowChips}>{chips}</View>
          {viewSwitch}
        </View>
      </View>
    );
  } else if (filterBar) {
    // Each filter gets its own width.
    pinnedFilters = (
      <View style={styles.filterBar}>
        {select ? <View style={cell}>{select}</View> : null}
        {chips ? <View style={styles.barChips}>{chips}</View> : null}
        <View style={cell}>{viewSwitch}</View>
      </View>
    );
  }

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
        {filterColumn ? null : <ResultsProgress results={listed} />}
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

  // The scroll view has three children, in this order: stickyHeaderIndices pins the second.
  // iOS and Android count the children without the null ones and web with them, so none of
  // the three is conditional.
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        testID="competition-details-screen"
      >
        <View
          style={styles.bandUnderBar}
          onLayout={(e) => setBandHeight(e.nativeEvent.layout.height)}
        >
          <ScreenHeader
            backLabel={t("details.back")}
            onBack={goBack}
            eyebrow={league?.name}
            title={competition?.name ?? t("common.competition_fallback")}
            loading={loadingComp}
            compact
          />
        </View>

        <PinnedHeader
          bar={
            <ScreenHeader
              backLabel={t("details.back")}
              onBack={goBack}
              title={competition?.name ?? t("common.competition_fallback")}
              loading={loadingComp}
              collapsed
              inert={!collapsed}
              contentOpacity={barContentOpacity}
            />
          }
          opacity={barOpacity}
        >
          {pinnedFilters}
        </PinnedHeader>

        <View style={[styles.body, filterColumn && styles.bodyFilterColumn]}>
          {filterColumn
            ? (
              <>
                <View style={[styles.filters, styles.filterColumn, cell]}>
                  {select}
                  {chips}
                  {viewSwitch}
                  {listed ? <ResultsProgress results={listed} /> : null}
                </View>
                <View style={styles.resultsBesideFilters}>{renderResults()}</View>
              </>
            )
            : renderResults()}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120 },
    // The pinned header's bar overlaps the band's bottom.
    bandUnderBar: { marginBottom: -BAR_HEIGHT },
    body: { paddingHorizontal: 20, gap: 12 },
    filters: { gap: 10 },

    // Pinned header: cream under the bar's rounded corners and under the filters, so the
    // results scroll out of sight beneath them, with a line along the bottom once collapsed.
    barUnderlay: { backgroundColor: c.cream },
    pinnedBody: {
      backgroundColor: c.cream,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 12,
    },
    pinnedEdge: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 1,
      backgroundColor: c.line,
    },
    // Phone: the chips scroll beside the view switch, bleeding over the left gutter only.
    chipsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    chipsRowChips: { flex: 1, minWidth: 0 },

    // Three grid columns or more: the filters take the first one, one cell wide, and stay in
    // view, under the collapsed bar, while the matches scroll.
    bodyFilterColumn: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: GRID_GAP,
      paddingTop: 14,
    },
    filterColumn: {
      // Web only, and missing from React Native's position type.
      position: "sticky" as ViewStyle["position"],
      top: BAR_HEIGHT + 16,
    },
    resultsBesideFilters: { flex: 1, minWidth: 0, gap: 12 },
    // Two columns, and the bracket: the filters on a line above the results (two when the
    // window is narrow). The field and the segments are a cell wide. The progress follows,
    // with the results, as it is not pinned.
    filterBar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: GRID_GAP },
    barChips: { flexGrow: 1, flexBasis: 200 },

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
