import { type Href, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardGrid } from "@/components/CardGrid";
import { CardLink } from "@/components/CardLink";
import { ChevronDown, ChevronRight, ChevronUp, RotateCcw, Trophy } from "@/components/icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { SelectField } from "@/components/SelectField";
import { SpecialtyLabel } from "@/components/SpecialtyLabel";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import {
  clubEntries,
  type ClubEntry,
  type ClubMatch,
  clubMatches,
  type ClubOutcome,
  clubTitles,
  latestResults,
  matchesByDate,
  seasonSummary,
} from "@/features/clubs/club";
import { formatMatchDate } from "@/features/competitions/matchDate";
import { matchPhaseLabel } from "@/features/competitions/matchPhase";
import { formatSeason, groupBySeason, parseSeason } from "@/features/competitions/seasons";
import { GUTTER, TEXT_MAX_WIDTH } from "@/features/layout/breakpoints";
import { useClub } from "@/hooks/use-clubs";
import { useCompetitions } from "@/hooks/use-competitions";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
import { useClubResults } from "@/hooks/use-matches";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/** On web, the results list keeps to the text column, inside the screen's gutters. */
const LIST_MAX_WIDTH = TEXT_MAX_WIDTH - 2 * GUTTER;

const entryHref = (entry: ClubEntry, categoryId: string): Extract<Href, string> =>
  `/(tabs)/competitions/details?id=${entry.competition.id}&specialtyId=${entry.specialty.id}&categoryId=${categoryId}`;

const OUTCOME_TONE = {
  won: "green",
  lost: "red",
  internal: "soft",
  even: "soft",
} as const satisfies Record<Exclude<ClubOutcome, "unplayed">, string>;

// ─── Season summary ───────────────────────────────────────────────────────────

function StatCell({ value, label }: { value: number; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statCell} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SummaryStrip({ matches }: { matches: ClubMatch[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const summary = seasonSummary(matches);
  return (
    <View style={styles.summary} testID="club-summary">
      <View style={styles.statsRow}>
        <StatCell value={summary.played} label={t("club.stat_played")} />
        <View style={styles.statDivider} />
        <StatCell value={summary.won} label={t("club.stat_won")} />
        <View style={styles.statDivider} />
        <StatCell value={summary.lost} label={t("club.stat_lost")} />
      </View>
      {summary.internal > 0
        ? (
          <Text style={styles.note} testID="club-internal-note">
            {t("club.internal_note", { count: summary.internal })}
          </Text>
        )
        : null}
    </View>
  );
}

// ─── Entries ──────────────────────────────────────────────────────────────────

function EntryCard({ entry, showCompetition }: { entry: ClubEntry; showCompetition: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const round = entry.title
    ? t("ranking.champion")
    : entry.furthest
    ? t(`rounds.${entry.furthest}`)
    : null;
  const meta = [
    // The picker names the season: "Championnat Jeunes CCAPB", not its full name.
    showCompetition ? parseSeason(entry.competition.name)?.label ?? entry.competition.name : null,
    entry.category?.name,
    t("details.matches_count", { count: entry.matches }),
  ].filter(Boolean);

  const body = (
    <>
      <View style={styles.cardBody}>
        <SpecialtyLabel name={entry.specialty.name} textStyle={styles.cardTitle} />
        <Text style={styles.cardMeta}>{meta.join(" · ")}</Text>
        {round
          ? (
            <View style={styles.pillRow}>
              <StatusPill label={round} tone={entry.title ? "amber" : "soft"} size="small" />
            </View>
          )
          : null}
      </View>
      {entry.category ? <ChevronRight color={colors.muted} size={18} /> : null}
    </>
  );
  const label = [entry.specialty.name, ...meta, round].filter(Boolean).join(", ");

  // A result without a category cannot be picked on the results screen: no link.
  return entry.category
    ? (
      <CardLink
        href={entryHref(entry, entry.category.id)}
        style={[styles.card, styles.cardRow]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t("club.entry_hint")}
        testID={`club-entry-${entry.key}`}
      >
        {body}
      </CardLink>
    )
    : (
      <View style={[styles.card, styles.cardRow]} accessible accessibilityLabel={label}>
        {body}
      </View>
    );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function useMatchWords(match: ClubMatch) {
  const { t, i18n } = useTranslation();
  const { result, outcome, sets } = match;
  return {
    opponent: outcome === "internal" ? t("club.internal_match") : match.opponent.name,
    outcome: outcome === "unplayed" ? null : t(`club.outcome_${outcome}`),
    sets: sets?.map((s) => `${s.club}-${s.opponent}`) ?? [],
    details: [
      matchPhaseLabel(result.phase, t),
      result.category?.name,
      // The language the strings resolved to, so a "de" device gets an English date too.
      formatMatchDate(result.dateMatch, i18n.resolvedLanguage ?? "en")
        ?? t("details.date_to_come"),
    ].filter((part): part is string => !!part),
  };
}

/** One match from the club's side: the opponent and the score, then the outcome and the round. */
function ResultRow({ match, first }: { match: ClubMatch; first: boolean }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const words = useMatchWords(match);
  const score = words.sets.join(" ");
  const label = [
    words.outcome,
    match.outcome === "internal" ? words.opponent : t("club.against", { name: words.opponent }),
    ...words.sets,
    match.result.specialty.name,
    ...words.details,
  ].filter(Boolean).join(", ");

  return (
    <View
      style={[styles.resultRow, !first && styles.rowLine]}
      accessible
      accessibilityLabel={label}
      testID={`club-result-${match.result.id}`}
    >
      <View style={styles.resultTop}>
        <Text style={styles.opponent}>{words.opponent}</Text>
        <Text style={[styles.score, !score && styles.scoreNone]}>{score || "—"}</Text>
      </View>
      <SpecialtyLabel name={match.result.specialty.name} textStyle={styles.resultSpecialty} />
      <View style={styles.pillRow}>
        {words.outcome && match.outcome !== "unplayed"
          ? <StatusPill label={words.outcome} tone={OUTCOME_TONE[match.outcome]} size="small" />
          : null}
        <Text style={styles.resultMeta}>{words.details.join(" · ")}</Text>
      </View>
    </View>
  );
}

function ResultsSection({ matches }: { matches: ClubMatch[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const [all, setAll] = useState(false);
  const latest = useMemo(() => latestResults(matches), [matches]);
  const byDate = useMemo(() => matchesByDate(matches), [matches]);
  const shown = all ? byDate : latest;

  return (
    <View style={styles.section}>
      <SectionHeader eyebrow={t("club.latest_eyebrow")} title={t("club.latest_title")} />
      {shown.length > 0 && (
        <View style={styles.list} testID="club-results">
          {shown.map((match, i) => (
            <ResultRow key={match.result.id} match={match} first={i === 0} />
          ))}
        </View>
      )}
      {byDate.length > latest.length && (
        <Pressable
          style={(state: InteractionState) => [
            styles.toggle,
            state.pressed && styles.togglePressed,
            state.hovered && interaction.hoverBorder,
            showsFocusRing(state) && interaction.focusRing,
          ]}
          onPress={() => setAll((value) => !value)}
          accessibilityRole="button"
          aria-expanded={all}
          testID="club-see-all"
        >
          <Text style={styles.toggleLabel}>
            {all ? t("club.see_latest") : t("club.see_all", { count: byDate.length })}
          </Text>
          {all
            ? <ChevronUp color={colors.ink} size={18} />
            : <ChevronDown color={colors.ink} size={18} />}
        </Pressable>
      )}
    </View>
  );
}

// ─── Titles ───────────────────────────────────────────────────────────────────

function TitleCard({ match }: { match: ClubMatch }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const words = useMatchWords(match);
  const final = match.outcome === "internal"
    ? t("club.title_internal")
    : t("club.title_against", { name: match.opponent.name });
  const meta = [match.result.category?.name, words.sets.join(" ")].filter(Boolean).join(" · ");

  return (
    <View
      style={[styles.card, styles.cardRow, styles.cardWon]}
      accessible
      accessibilityLabel={[
        t("ranking.champion"),
        match.result.specialty.name,
        match.result.category?.name,
        ...words.sets,
        final,
      ].filter(Boolean).join(", ")}
      testID={`club-title-${match.result.id}`}
    >
      <View style={styles.trophy}>
        <Trophy color={colors.amber} size={18} />
      </View>
      <View style={styles.cardBody}>
        <SpecialtyLabel name={match.result.specialty.name} textStyle={styles.cardTitle} />
        <Text style={styles.cardMeta}>{meta}</Text>
        <Text style={styles.cardText}>{final}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ClubScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { columns } = useWebLayout();
  const { id = "", season: seasonParam } = useLocalSearchParams<{
    id: string;
    season?: string;
  }>();

  const { data: club, isPending: clubPending } = useClub(id);
  const competitions = useCompetitions();
  // Every season the league has, the current one first.
  const seasons = useMemo(() => {
    const grouped = groupBySeason(competitions.data ?? []);
    return grouped ? [grouped.current, ...grouped.previous] : [];
  }, [competitions.data]);
  const group = seasons.find((s) => formatSeason(s.season) === seasonParam) ?? seasons[0];
  const seasonOptions = useMemo(
    () => seasons.map(({ season }) => ({ id: formatSeason(season), name: formatSeason(season) })),
    [seasons],
  );

  // One request per competition of the season (lcapb: Championnat; Jeunes and Corpo when shown).
  const pairs = useMemo(
    () =>
      group?.competitions.map(({ competition }) => ({ clubId: id, competitionId: competition.id }))
        ?? [],
    [group, id],
  );
  const results = useClubResults(pairs);
  const matches = useMemo(
    () => (results.data ? clubMatches(results.data, id) : null),
    [results.data, id],
  );
  const entries = useMemo(() => (matches ? clubEntries(matches) : []), [matches]);
  const titles = useMemo(() => (matches ? clubTitles(matches) : []), [matches]);

  // `isPending`, not `isLoading`: the static web export renders without the id, so the queries
  // are disabled there and stay pending, and the static HTML matches the first client render.
  const isPending = competitions.isPending || results.isPending;
  const isError = competitions.isError || results.isError;
  const error = competitions.error ?? results.error;
  const isRefetching = competitions.isRefetching || results.isRefetching;
  const retry = () => {
    if (competitions.isError) competitions.refetch();
    results.refetch();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="club-screen"
      >
        <ScreenHeader
          backLabel={t("common.back")}
          eyebrow={t("club.eyebrow")}
          title={club?.name ?? t("club.title")}
          loading={clubPending}
        />

        <View style={styles.body}>
          {seasonOptions.length > 0 && group && (
            <View style={styles.picker}>
              <SelectField
                label={t("club.season")}
                hint={t("club.season_hint")}
                options={seasonOptions}
                value={formatSeason(group.season)}
                onChange={(season) => router.setParams({ season })}
                testID="club-season"
              />
            </View>
          )}

          {isPending && !isError && (
            <View style={styles.centered}>
              <ActivityIndicator
                color={colors.red}
                size="large"
                accessibilityLabel={t("common.loading")}
              />
            </View>
          )}

          {isError && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorTitle}>{t("club.error_load")}</Text>
              {error instanceof Error && error.message
                ? <Text style={styles.errorDetail}>{error.message}</Text>
                : null}
              <Pressable
                style={styles.retryButton}
                onPress={retry}
                disabled={isRefetching}
                accessibilityRole="button"
                accessibilityLabel={t("error.retry")}
                accessibilityState={{ busy: isRefetching, disabled: isRefetching }}
              >
                {isRefetching
                  ? <ActivityIndicator color={colors.red} size="small" />
                  : <RotateCcw color={colors.red} size={14} />}
                <Text style={styles.retryLabel}>{t("error.retry")}</Text>
              </Pressable>
            </View>
          )}

          {!isPending && !isError && matches?.length === 0 && (
            <View style={styles.emptyBox} testID="club-empty">
              <Text style={styles.emptyText}>
                {t("club.empty", { season: group ? formatSeason(group.season) : "" })}
              </Text>
            </View>
          )}

          {!isError && matches && matches.length > 0 && (
            <>
              <SummaryStrip matches={matches} />

              <View style={styles.section}>
                <SectionHeader
                  eyebrow={t("club.entries_eyebrow")}
                  title={t("club.entries_title")}
                />
                <CardGrid columns={columns} style={styles.grid}>
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.key}
                      entry={entry}
                      showCompetition={pairs.length > 1}
                    />
                  ))}
                </CardGrid>
              </View>

              <ResultsSection key={group ? formatSeason(group.season) : ""} matches={matches} />

              {titles.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    eyebrow={t("club.titles_eyebrow")}
                    title={t("club.titles_title")}
                  />
                  <CardGrid columns={columns} style={styles.grid}>
                    {titles.map((match) => <TitleCard key={match.result.id} match={match} />)}
                  </CardGrid>
                </View>
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
    body: { paddingHorizontal: 20, paddingTop: 22, gap: 22 },
    picker: { width: "100%", maxWidth: LIST_MAX_WIDTH },

    // States
    centered: { paddingVertical: 60, alignItems: "center" },
    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    errorDetail: { color: c.muted, fontSize: 12, fontWeight: "600" },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.red,
      marginTop: 4,
    },
    retryLabel: { color: c.red, fontSize: 14, fontWeight: "700" },
    emptyBox: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line,
    },
    emptyText: { color: c.muted, fontSize: 14, fontWeight: "600", textAlign: "center" },

    // Season summary
    summary: { width: "100%", maxWidth: LIST_MAX_WIDTH, gap: 8 },
    statsRow: {
      flexDirection: "row",
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
    },
    statCell: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, gap: 4 },
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
      textAlign: "center",
    },
    statDivider: { width: 1, backgroundColor: c.line, marginVertical: 12 },
    note: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },

    // Sections and cards
    section: { gap: 12 },
    grid: { gap: 10 },
    card: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      padding: 14,
    },
    cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardWon: { borderWidth: 2, borderColor: c.amber, alignItems: "flex-start" },
    cardBody: { flex: 1, gap: 6 },
    cardTitle: { color: c.ink, fontSize: 15, fontWeight: "700" },
    cardMeta: { color: c.muted, fontSize: 12, fontWeight: "600" },
    cardText: { color: c.text, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 8,
      rowGap: 4,
    },
    trophy: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.amberBg,
      borderWidth: 1,
      borderColor: c.amber,
      alignItems: "center",
      justifyContent: "center",
    },

    // Results: one card, rows split by hairlines.
    list: {
      width: "100%",
      maxWidth: LIST_MAX_WIDTH,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    rowLine: { borderTopWidth: 1, borderTopColor: c.line },
    resultRow: { gap: 6, paddingVertical: 12, paddingHorizontal: 14 },
    resultTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    opponent: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "700", lineHeight: 20 },
    score: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      fontVariant: ["tabular-nums"],
    },
    scoreNone: { color: c.muted, fontWeight: "400" },
    resultSpecialty: { color: c.text, fontSize: 13, fontWeight: "600" },
    resultMeta: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16, flexShrink: 1 },

    // See all
    toggle: {
      width: "100%",
      maxWidth: LIST_MAX_WIDTH,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 9999,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 20,
    },
    togglePressed: { backgroundColor: c.line },
    toggleLabel: { color: c.ink, fontSize: 15, fontWeight: "700" },
  });
