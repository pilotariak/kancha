import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClubLink } from "@/components/ClubLink";
import { FilterChips } from "@/components/FilterChips";
import { FollowButton } from "@/components/FollowButton";
import { FormSquares } from "@/components/FormSquares";
import { ChevronDown, ChevronRight, RotateCcw, Trophy } from "@/components/icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { type Segment, SegmentedControl } from "@/components/SegmentedControl";
import { SpecialtyLabel } from "@/components/SpecialtyLabel";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { scoreDigits } from "@/constants/typography";
import { formatMatchDate } from "@/features/competitions/matchDate";
import { matchPhaseLabel } from "@/features/competitions/matchPhase";
import { keepSeasonTogether } from "@/features/competitions/seasons";
import { GRID_GAP, GUTTER, TEXT_MAX_WIDTH } from "@/features/layout/breakpoints";
import {
  currentStreak,
  type MatchRecord,
  type MatchTotals,
  matchTotals,
  partnerRecords,
  playerForm,
  type PlayerMatch,
} from "@/features/players/matches";
import {
  bestResult,
  clubsBySeason,
  currentClub,
  latestSeason,
  matchSeasons,
  parsePlayerTab,
  pickSeason,
  PLAYER_TABS,
  playerInitials,
  type PlayerTab,
  playerTitles,
  type SeasonEntry,
  seasonLabel,
  type SeasonMatches,
  setScores,
  specialtyTable,
  teammatesWithoutMatch,
  topOpponents,
  unbreakableScore,
  winPercent,
} from "@/features/players/profile";
import { buildPlayerStats, type HistoryEntry, type PlayerStats } from "@/features/players/stats";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
import { type PlayerMatches, usePlayerMatches, usePlayerRankings } from "@/hooks/use-players";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import type { PlayerRanking } from "@/types/competition";

/** On web, lists keep to the text column, inside the screen's gutters. */
const LIST_MAX_WIDTH = TEXT_MAX_WIDTH - 2 * GUTTER;

const ALL_SEASONS = "all";

const OUTCOME_TONE = { won: "green", lost: "red", even: "soft" } as const;

function openPlayer(licence: string) {
  router.push({ pathname: "/(tabs)/competitions/player", params: { licence } });
}

const record = (r: Pick<MatchRecord, "won" | "lost">) => `${r.won}-${r.lost}`;
const names = (players: readonly { name: string }[]) => players.map((p) => p.name).join(" / ");

/** A record in words, for a screen reader: "7 victoires, 0 défaite". */
function useRecordLabel() {
  const { t } = useTranslation();
  return (r: Pick<MatchRecord, "won" | "lost">) =>
    `${t("ranking.wins_a11y", { count: r.won })}, ${t("ranking.losses_a11y", { count: r.lost })}`;
}

// ─── States ───────────────────────────────────────────────────────────────────

function ErrorBox(
  { title, error, onRetry, retrying }: {
    title: string;
    error: Error | null;
    onRetry: () => void;
    retrying: boolean;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Text style={styles.errorTitle}>{title}</Text>
      {error?.message ? <Text style={styles.errorDetail}>{error.message}</Text> : null}
      <Pressable
        style={styles.retryButton}
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        accessibilityLabel={t("error.retry")}
        accessibilityState={{ busy: retrying, disabled: retrying }}
      >
        {retrying
          ? <ActivityIndicator color={colors.red} size="small" />
          : <RotateCcw color={colors.red} size={14} />}
        <Text style={styles.retryLabel}>{t("error.retry")}</Text>
      </Pressable>
    </View>
  );
}

/** While the matches load: a spinner, or the error with a retry. */
function MatchesStatus({ matches }: { matches: PlayerMatches }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (matches.isError) {
    return (
      <ErrorBox
        title={t("player.matches_error")}
        error={matches.error}
        onRetry={matches.refetch}
        retrying={matches.isRefetching}
      />
    );
  }
  return (
    <View style={styles.centered} testID="player-matches-loading">
      <ActivityIndicator color={colors.red} accessibilityLabel={t("player.matches_loading")} />
    </View>
  );
}

function EmptyBox({ text, testID }: { text: string; testID?: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.emptyBox} testID={testID}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function Section(
  { eyebrow, title, testID, children }: {
    eyebrow: string;
    title: string;
    testID?: string;
    children: ReactNode;
  },
) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.section} testID={testID}>
      <SectionHeader eyebrow={eyebrow} title={title} />
      {children}
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Initials({ initials }: { initials: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.initials} aria-hidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

function StatCell({ value, label, a11y }: { value: string | null; label: string; a11y?: string }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={styles.statCell}
      accessible
      accessibilityLabel={`${label}: ${value === null ? t("common.loading") : a11y ?? value}`}
    >
      <Text style={[styles.statValue, value === null && styles.statPending]}>{value ?? "—"}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Titles and seasons from the rankings; the record and win rate once the matches load. */
function StatsStrip({ stats, totals }: { stats: PlayerStats; totals: MatchTotals | null }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const recordLabel = useRecordLabel();
  const percent = totals ? winPercent(totals) : null;
  return (
    <View style={styles.statsGrid} testID="player-stats">
      <View style={styles.statsRow}>
        <StatCell value={String(stats.totals.titles)} label={t("player.stat_titles")} />
        <View style={styles.statDivider} />
        <StatCell
          value={totals ? record(totals) : null}
          label={t("player.stat_record")}
          a11y={totals ? recordLabel(totals) : undefined}
        />
      </View>
      <View style={styles.statsRowDivider} />
      <View style={styles.statsRow}>
        <StatCell
          value={totals ? (percent === null ? "—" : t("player.win_rate", { rate: percent })) : null}
          label={t("player.stat_win_rate")}
        />
        <View style={styles.statDivider} />
        <StatCell value={String(stats.totals.seasons)} label={t("player.stat_seasons")} />
      </View>
    </View>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function FormSection({ matches }: { matches: PlayerMatch[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const form = playerForm(matches);
  const streak = currentStreak(matches);
  return (
    <Section eyebrow={t("player.form_eyebrow")} title={t("player.form_title")} testID="player-form">
      {form.length > 0
        ? (
          <View style={styles.card}>
            <FormSquares form={form} size={18} />
            {streak
              ? (
                <Text style={styles.cardText}>
                  {t(streak.result === "W" ? "player.streak_won" : "player.streak_lost", {
                    count: streak.count,
                  })}
                </Text>
              )
              : null}
          </View>
        )
        : <EmptyBox text={t("player.form_empty")} />}
    </Section>
  );
}

function RankingPills(
  { entry }: { entry: Pick<SeasonEntry, "isTitle" | "isForfeit" | "phase" | "final"> },
) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.pillRow}>
      {entry.isTitle
        ? <StatusPill label={t("ranking.champion")} tone="amber" size="small" />
        : <StatusPill label={entry.phase} tone={entry.isForfeit ? "red" : "soft"} size="small" />}
      {!entry.final && <StatusPill label={t("ranking.provisional")} tone="soft" size="small" />}
    </View>
  );
}

function LatestSeasonSection({ rankings, matches }: {
  rankings: PlayerRanking[];
  matches: PlayerMatch[] | undefined;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const recordLabel = useRecordLabel();
  const season = latestSeason(rankings, matches);
  if (!season) return null;

  return (
    <Section
      eyebrow={t("player.latest_eyebrow")}
      title={seasonLabel(season.competition)}
      testID="player-latest"
    >
      <View style={styles.list}>
        {season.entries.map((entry, i) => {
          const details = entry.record
            ? [
              t("details.matches_count", { count: entry.record.played }),
              t("player.sets", { won: entry.record.setsWon, lost: entry.record.setsLost }),
            ].join(" · ")
            : null;
          return (
            <View
              key={entry.key}
              style={[styles.row, i > 0 && styles.rowLine]}
              testID={`player-latest-${entry.key}`}
            >
              <View style={styles.rowTop}>
                <View style={styles.rowBody}>
                  <SpecialtyLabel name={entry.specialty.name} textStyle={styles.rowTitle} />
                </View>
                {entry.record && entry.record.played > 0
                  ? (
                    <Text style={styles.record} accessibilityLabel={recordLabel(entry.record)}>
                      {record(entry.record)}
                    </Text>
                  )
                  : null}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{entry.category.name}</Text>
                <Text style={styles.meta} aria-hidden>·</Text>
                <ClubLink club={entry.club} textStyle={styles.meta} />
              </View>
              <View style={styles.pillRow}>
                <RankingPills entry={entry} />
                {details ? <Text style={styles.meta}>{details}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </Section>
  );
}

function SpecialtiesSection({ rankings, stats, matches }: {
  rankings: PlayerRanking[];
  stats: PlayerStats;
  matches: PlayerMatch[] | undefined;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const recordLabel = useRecordLabel();
  const rows = specialtyTable(rankings, stats.specialties, matches);
  if (rows.length === 0) return null;

  return (
    <Section
      eyebrow={t("player.specialties_eyebrow")}
      title={t("player.specialties_title")}
      testID="player-specialties"
    >
      <View style={styles.list}>
        <View style={styles.tableHead} aria-hidden importantForAccessibility="no-hide-descendants">
          <Text style={[styles.headLabel, styles.flex]}>{t("player.column_specialty")}</Text>
          <Text style={styles.headLabel}>{t("ranking.column_record")}</Text>
        </View>
        {rows.map((row, i) => {
          const result = bestResult(row.best);
          const best = !result
            ? null
            : result.kind === "titles"
            ? t("player.titles_count", { count: result.count })
            : result.kind === "champion"
            ? t("ranking.champion")
            : result.phase;
          const label = [
            row.specialty.name,
            row.record ? t("details.matches_count", { count: row.record.played }) : null,
            row.record ? recordLabel(row.record) : null,
            best ? t("player.best_a11y", { best }) : null,
          ].filter(Boolean).join(", ");
          return (
            <View
              key={row.specialty.id}
              style={[styles.row, i > 0 && styles.rowLine]}
              accessible
              accessibilityLabel={label}
              testID={`player-specialty-${row.specialty.id}`}
            >
              <View style={styles.rowTop}>
                <View style={styles.rowBody}>
                  <SpecialtyLabel name={row.specialty.name} textStyle={styles.rowTitle} />
                </View>
                <Text style={[styles.record, !row.record?.played && styles.recordNone]}>
                  {row.record?.played ? record(row.record) : "—"}
                </Text>
              </View>
              <View style={styles.pillRow}>
                {best
                  ? (
                    <StatusPill
                      label={best}
                      tone={result?.kind === "phase" ? "soft" : "amber"}
                      size="small"
                    />
                  )
                  : null}
                {row.record
                  ? (
                    <Text style={styles.meta}>
                      {t("details.matches_count", { count: row.record.played })}
                    </Text>
                  )
                  : null}
              </View>
            </View>
          );
        })}
      </View>
    </Section>
  );
}

/** A row that opens a player: their name, a line under it, and a record on the right. */
function PlayerRow({ licence, name, meta, value, label, first, testID }: {
  licence: string;
  name: string;
  meta: string;
  value: string;
  label: string;
  first: boolean;
  testID: string;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={(state: InteractionState) => [
        styles.row,
        styles.rowPressable,
        !first && styles.rowLine,
        (state.pressed || state.hovered) && styles.rowPressed,
        showsFocusRing(state) && styles.rowFocus,
      ]}
      onPress={() => openPlayer(licence)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t("player.open_hint")}
      testID={testID}
    >
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Text style={styles.record}>{value}</Text>
      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}

function PartnersSection({ stats, matches }: { stats: PlayerStats; matches: PlayerMatch[] }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const recordLabel = useRecordLabel();
  const partners = partnerRecords(matches);
  const teammates = teammatesWithoutMatch(stats.partners, partners);
  if (partners.length === 0 && teammates.length === 0) return null;

  return (
    <Section
      eyebrow={t("player.partners_eyebrow")}
      title={t("player.partners_title")}
      testID="player-partners"
    >
      {partners.length > 0
        ? (
          <View style={styles.list}>
            {partners.map((p, i) => {
              const count = t("details.matches_count", { count: p.played });
              return (
                <PlayerRow
                  key={p.licence}
                  licence={p.licence}
                  name={p.name}
                  meta={count}
                  value={record(p)}
                  label={`${p.name}, ${count}, ${recordLabel(p)}`}
                  first={i === 0}
                  testID={`player-partner-${p.licence}`}
                />
              );
            })}
          </View>
        )
        : null}
      {teammates.length > 0
        ? (
          <Text style={styles.note} testID="player-teammates">
            {t("player.teammates", {
              names: teammates
                .map((p) => p.name ?? t("ranking.licence", { licence: p.licence }))
                .join(", "),
            })}
          </Text>
        )
        : null}
    </Section>
  );
}

function OpponentsSection({ matches }: { matches: PlayerMatch[] }) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const recordLabel = useRecordLabel();
  const opponents = topOpponents(matches);
  if (opponents.length === 0) return null;

  return (
    <Section
      eyebrow={t("player.opponents_eyebrow")}
      title={t("player.opponents_title")}
      testID="player-opponents"
    >
      <View style={styles.list}>
        {opponents.map((o, i) => {
          const { last } = o;
          const lastMeeting = t("player.last_meeting", {
            date: formatMatchDate(last.result.dateMatch, i18n.resolvedLanguage ?? "en")
              ?? t("details.date_to_come"),
            season: keepSeasonTogether(seasonLabel(last.result.competition)),
            outcome: last.outcome === "unscored" ? "" : t(`club.outcome_${last.outcome}`),
            sets: unbreakableScore(setScores(last.sets)),
          });
          const meta = `${t("details.matches_count", { count: o.played })} · ${lastMeeting}`;
          return (
            <PlayerRow
              key={o.licence}
              licence={o.licence}
              name={o.name}
              meta={meta}
              value={record(o)}
              label={`${o.name}, ${recordLabel(o)}, ${meta}`}
              first={i === 0}
              testID={`player-opponent-${o.licence}`}
            />
          );
        })}
      </View>
    </Section>
  );
}

// ─── Matches ──────────────────────────────────────────────────────────────────

/** One match from the player's side: the opponents and the sets, then the result and round. */
function MatchRow({ match, first }: { match: PlayerMatch; first: boolean }) {
  const { t, i18n } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const opponents = names(match.opponents) || match.opponentClub.name;
  const sets = setScores(match.sets);
  const outcome = match.outcome === "unscored" ? null : t(`club.outcome_${match.outcome}`);
  const details = [
    matchPhaseLabel(match.result.phase, t),
    formatMatchDate(match.result.dateMatch, i18n.resolvedLanguage ?? "en")
      ?? t("details.date_to_come"),
  ].filter(Boolean).join(" · ");
  const partners = names(match.partners);
  const label = [
    outcome,
    t("club.against", { name: opponents }),
    match.opponentClub.name,
    ...sets,
    partners ? t("player.with", { names: partners }) : null,
    details,
  ].filter(Boolean).join(", ");

  return (
    <View
      style={[styles.row, !first && styles.rowLine]}
      accessible
      accessibilityLabel={label}
      testID={`player-match-${match.result.id}`}
    >
      <View style={styles.rowTop}>
        <Text style={[styles.rowTitle, styles.flex]}>{opponents}</Text>
        <Text style={[styles.sets, sets.length === 0 && styles.setsNone]}>
          {sets.length > 0 ? sets.join(" ") : "—"}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <ClubLink club={match.opponentClub} textStyle={styles.meta} />
        {partners
          ? <Text style={styles.meta}>{`· ${t("player.with", { names: partners })}`}</Text>
          : null}
      </View>
      <View style={styles.pillRow}>
        {outcome && match.outcome !== "unscored"
          ? <StatusPill label={outcome} tone={OUTCOME_TONE[match.outcome]} size="small" />
          : null}
        <Text style={styles.meta}>{details}</Text>
      </View>
    </View>
  );
}

function SeasonBlock({ season, initiallyOpen }: { season: SeasonMatches; initiallyOpen: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const recordLabel = useRecordLabel();
  const [open, setOpen] = useState(initiallyOpen);
  const count = t("details.matches_count", { count: season.record.played });
  const name = seasonLabel(season.competition);

  return (
    <View style={styles.seasonBlock} testID={`player-season-${season.competition.id}`}>
      <Pressable
        style={(state: InteractionState) => [
          styles.seasonHead,
          state.hovered && interaction.hoverBorder,
          showsFocusRing(state) && interaction.focusRing,
        ]}
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${count}, ${recordLabel(season.record)}`}
        aria-expanded={open}
        testID={`player-season-${season.competition.id}-toggle`}
      >
        <View style={styles.rowBody}>
          <Text style={styles.seasonName} accessibilityRole="header">{name}</Text>
          <Text style={styles.meta}>{count}</Text>
        </View>
        <Text style={styles.record}>{record(season.record)}</Text>
        <View style={open && styles.chevronOpen}>
          <ChevronDown color={colors.muted} size={18} />
        </View>
      </Pressable>
      {open
        ? season.groups.map((group) => (
          <View key={group.key} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={styles.rowBody}>
                <SpecialtyLabel name={group.specialty.name} textStyle={styles.rowTitle} />
                <Text style={styles.meta}>
                  {[
                    group.category?.name,
                    t("details.matches_count", { count: group.matches.length }),
                  ].filter(Boolean).join(" · ")}
                </Text>
              </View>
              <Text style={styles.record} accessibilityLabel={recordLabel(group.record)}>
                {record(group.record)}
              </Text>
            </View>
            <View style={styles.list}>
              {group.matches.map((match, i) => (
                <MatchRow key={match.result.id} match={match} first={i === 0} />
              ))}
            </View>
          </View>
        ))
        : null}
    </View>
  );
}

function MatchesTab({ matches, seasonParam }: { matches: PlayerMatches; seasonParam?: string }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const seasons = useMemo(() => (matches.data ? matchSeasons(matches.data) : []), [matches.data]);
  if (!matches.data) return <MatchesStatus matches={matches} />;
  if (seasons.length === 0) {
    return <EmptyBox text={t("player.matches_empty")} testID="player-matches-empty" />;
  }

  const picked = pickSeason(seasons, seasonParam);
  const shown = picked ? seasons.filter((s) => s.competition.id === picked) : seasons;
  const options = [
    { id: ALL_SEASONS, name: t("player.all_seasons") },
    ...seasons.map((s) => ({ id: s.competition.id, name: seasonLabel(s.competition) })),
  ];

  return (
    <View style={styles.section} testID="player-matches">
      <FilterChips
        options={options}
        value={picked ?? ALL_SEASONS}
        onChange={(season) => router.setParams({ season })}
        accessibilityLabel={t("player.seasons_a11y")}
        wrap
        testID="player-season-chips"
      />
      {/* A new choice of season starts over: the latest, or the one picked, open. */}
      <View key={picked ?? ALL_SEASONS} style={styles.seasons}>
        {shown.map((season, i) => (
          <SeasonBlock key={season.competition.id} season={season} initiallyOpen={i === 0} />
        ))}
      </View>
    </View>
  );
}

// ─── Honours ──────────────────────────────────────────────────────────────────

function TitlesSection({ rankings, matches }: {
  rankings: PlayerRanking[];
  matches: PlayerMatch[] | undefined;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const titles = playerTitles(rankings, matches);

  return (
    <Section
      eyebrow={t("player.titles_eyebrow")}
      title={t("player.titles_title")}
      testID="player-titles"
    >
      {titles.length === 0 ? <EmptyBox text={t("player.titles_empty")} /> : null}
      {titles.map(({ ranking, final }) => {
        const meta = [ranking.category.name, seasonLabel(ranking.competition)].join(" · ");
        const against = final
          ? t("club.title_against", { name: names(final.opponents) || final.opponentClub.name })
          : null;
        const sets = final ? setScores(final.sets) : [];
        const date = final
          ? formatMatchDate(final.result.dateMatch, i18n.resolvedLanguage ?? "en")
          : null;
        return (
          <View
            key={ranking.id}
            style={[styles.card, styles.cardRow, styles.cardWon]}
            accessible
            accessibilityLabel={[
              t("ranking.champion"),
              ranking.specialty.name,
              meta,
              against,
              ...sets,
              date,
            ].filter(Boolean).join(", ")}
            testID={`player-title-${ranking.id}`}
          >
            <View style={styles.trophy}>
              <Trophy color={colors.amber} size={18} />
            </View>
            <View style={styles.rowBody}>
              <SpecialtyLabel name={ranking.specialty.name} textStyle={styles.rowTitle} />
              <Text style={styles.meta}>{meta}</Text>
              {final
                ? (
                  <>
                    <Text style={styles.cardText}>{against}</Text>
                    <View style={styles.pillRow}>
                      <Text style={styles.sets}>{sets.join(" ")}</Text>
                      {date ? <Text style={styles.meta}>{date}</Text> : null}
                    </View>
                  </>
                )
                : null}
            </View>
          </View>
        );
      })}
    </Section>
  );
}

function RankingRow({ entry, first }: { entry: HistoryEntry; first: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[styles.row, styles.rankingRow, !first && styles.rowLine]}
      testID={`player-ranking-${entry.id}`}
    >
      <View
        style={styles.rankCell}
        accessible
        accessibilityLabel={t("ranking.rank_a11y", { rank: entry.rank })}
      >
        {entry.isTitle
          ? <Trophy color={colors.amber} size={18} />
          : <Text style={styles.rank}>{entry.rank}</Text>}
      </View>
      <View style={styles.rowBody}>
        <SpecialtyLabel name={entry.specialtyName} textStyle={styles.rowTitle} />
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{entry.categoryName}</Text>
          <Text style={styles.meta} aria-hidden>·</Text>
          <ClubLink club={entry.club} textStyle={styles.meta} />
        </View>
        <RankingPills entry={entry} />
      </View>
    </View>
  );
}

function HonoursTab({ rankings, stats, matches }: {
  rankings: PlayerRanking[];
  stats: PlayerStats;
  matches: PlayerMatch[] | undefined;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const clubs = clubsBySeason(rankings);
  return (
    <>
      <TitlesSection rankings={rankings} matches={matches} />

      <Section
        eyebrow={t("player.history_eyebrow")}
        title={t("player.history_title")}
        testID="player-rankings"
      >
        {/* One table, a head row per season: a season of one ranking is no card of its own. */}
        <View style={styles.list}>
          {stats.seasons.map((season, s) => (
            <React.Fragment key={season.competition.id}>
              <Text
                style={[styles.headLabel, styles.seasonRow, s > 0 && styles.rowLine]}
                accessibilityRole="header"
              >
                {season.competition.name}
              </Text>
              {season.rankings.map((entry) => (
                <RankingRow key={entry.id} entry={entry} first={false} />
              ))}
            </React.Fragment>
          ))}
        </View>
      </Section>

      <Section
        eyebrow={t("player.clubs_eyebrow")}
        title={t("player.clubs_title")}
        testID="player-clubs"
      >
        <View style={styles.list}>
          {clubs.map(({ competition, clubs: seasonClubs }, i) => (
            <View
              key={competition.id}
              style={[styles.row, styles.clubRow, i > 0 && styles.rowLine]}
            >
              <Text style={styles.clubSeason}>{seasonLabel(competition)}</Text>
              <View style={styles.clubNames}>
                {seasonClubs.map((club) => (
                  <ClubLink key={club.id} club={club} textStyle={styles.clubName} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayerScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const { columns, cellWidth } = useWebLayout();
  const wide = columns > 1;
  const { licence = "", tab: tabParam, season: seasonParam } = useLocalSearchParams<{
    licence: string;
    tab?: string;
    season?: string;
  }>();
  const tab = parsePlayerTab(tabParam);

  // `isPending`, not `isLoading`: the static web export renders without the licence, so the
  // queries are disabled there. They stay pending, and the static HTML matches the first client
  // render (a spinner, no tabs) instead of an empty state.
  const rankings = usePlayerRankings(licence);
  const matches = usePlayerMatches(licence);
  const stats = useMemo(
    () => (rankings.data ? buildPlayerStats(licence, rankings.data) : null),
    [rankings.data, licence],
  );
  const totals = useMemo(() => (matches.data ? matchTotals(matches.data) : null), [matches.data]);

  const name = stats?.name ?? null;
  const club = rankings.data ? currentClub(rankings.data) : null;
  const initials = playerInitials(name);
  const subtitle = [name ? t("ranking.licence", { licence }) : null, club?.name]
    .filter(Boolean)
    .join(" · ");

  const segments: Segment<PlayerTab>[] = PLAYER_TABS.map((value) => ({
    value,
    label: t(`player.tab_${value}`),
  }));

  function body(data: PlayerRanking[], playerStats: PlayerStats) {
    // One spinner or error for the matches: in the form's place, unless the matches tab, beside
    // it in the wide layout, shows its own.
    const form = matches.data
      ? <FormSection matches={matches.data} />
      : wide && tab === "matches"
      ? null
      : <MatchesStatus matches={matches} />;
    const latest = <LatestSeasonSection rankings={data} matches={matches.data} />;
    const specialties = (
      <SpecialtiesSection rankings={data} stats={playerStats} matches={matches.data} />
    );
    const people = matches.data
      ? (
        <>
          <PartnersSection stats={playerStats} matches={matches.data} />
          <OpponentsSection matches={matches.data} />
        </>
      )
      : null;

    // On a phone the overview holds everything. Wide, its first half sits in the left column,
    // whose form slot also shows the matches' spinner or error: the panel does not repeat it.
    const panel = tab === "matches"
      ? <MatchesTab matches={matches} seasonParam={seasonParam} />
      : tab === "honours"
      ? <HonoursTab rankings={data} stats={playerStats} matches={matches.data} />
      : wide
      ? people
      : (
        <>
          {form}
          {latest}
          {specialties}
          {people}
        </>
      );

    const tabs = (
      <View style={styles.tabs}>
        <SegmentedControl
          segments={segments}
          value={tab}
          onChange={(next) => router.setParams({ tab: next })}
          testID="player-tabs"
        />
        <View
          role="tabpanel"
          accessibilityLabel={t(`player.tab_${tab}`)}
          style={styles.panel}
          testID={`player-panel-${tab}`}
        >
          {panel}
        </View>
      </View>
    );

    if (!wide) {
      return (
        <>
          <StatsStrip stats={playerStats} totals={totals} />
          {tabs}
        </>
      );
    }
    return (
      <View style={styles.columns}>
        <View style={[styles.side, { width: cellWidth }]} testID="player-side">
          <StatsStrip stats={playerStats} totals={totals} />
          {form}
          {latest}
          {specialties}
        </View>
        <View style={styles.main}>{tabs}</View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="player-screen"
      >
        <ScreenHeader
          compact
          backLabel={t("common.back")}
          eyebrow={t("player.eyebrow")}
          title={name ?? t("ranking.licence", { licence })}
          subtitle={subtitle || undefined}
          loading={rankings.isPending}
          trailing={initials ? <Initials initials={initials} /> : null}
          action={stats && stats.totals.rankings > 0
            ? (
              <FollowButton
                favourite={{ kind: "player", licence, name }}
                name={name ?? t("ranking.licence", { licence })}
                testID="player-follow"
              />
            )
            : null}
        />

        <View style={styles.body}>
          {rankings.isError && (
            <ErrorBox
              title={t("player.error_load")}
              error={rankings.error}
              onRetry={() => rankings.refetch()}
              retrying={rankings.isRefetching}
            />
          )}

          {rankings.data?.length === 0 && <EmptyBox text={t("player.empty")} />}

          {rankings.data && stats && stats.totals.rankings > 0
            ? body(rankings.data, stats)
            : null}
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
    body: { paddingHorizontal: GUTTER, paddingTop: 22, gap: 22 },
    flex: { flex: 1 },

    // Wide: a cell for the player, the tabs beside it, the text column at most.
    columns: { flexDirection: "row", alignItems: "flex-start", gap: GRID_GAP },
    side: { gap: 22 },
    main: { flex: 1, minWidth: 0, maxWidth: LIST_MAX_WIDTH },
    tabs: { width: "100%", maxWidth: LIST_MAX_WIDTH, gap: 22 },
    panel: { gap: 22 },

    // Header
    initials: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.redDark,
      borderWidth: 1.5,
      borderColor: c.onRedSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    initialsText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },

    // States
    centered: { paddingVertical: 32, alignItems: "center" },
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

    // Figures: two rows of two, as four in a row leave labels like "Denboraldiak" no room.
    statsGrid: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
    },
    statsRow: { flexDirection: "row" },
    statCell: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, gap: 4 },
    statValue: { ...scoreDigits.black, color: c.ink, fontSize: 30, lineHeight: 32 },
    statPending: { color: c.muted },
    statLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      textAlign: "center",
    },
    statDivider: { width: 1, backgroundColor: c.line, marginVertical: 12 },
    statsRowDivider: { height: 1, backgroundColor: c.line, marginHorizontal: 12 },

    // Sections, cards and lists
    section: { gap: 12 },
    card: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      padding: 14,
      gap: 10,
    },
    cardRow: { flexDirection: "row", gap: 12 },
    cardWon: { borderWidth: 2, borderColor: c.amber },
    cardText: { color: c.text, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    note: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
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
    // One card, rows split by hairlines, as the ranking table and the club results.
    list: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    tableHead: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    headLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    row: { gap: 6, paddingVertical: 12, paddingHorizontal: 14 },
    rowLine: { borderTopWidth: 1, borderTopColor: c.line },
    rowPressable: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
    rowPressed: { backgroundColor: c.cream },
    // The ring stays inside the list, whose corners clip it.
    rowFocus: {
      outlineColor: c.red,
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: -2,
    },
    rowTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    rowBody: { flex: 1, minWidth: 0, gap: 4 },
    rowTitle: { color: c.ink, fontSize: 15, fontWeight: "700", lineHeight: 20 },
    meta: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 6,
      rowGap: 2,
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 8,
      rowGap: 4,
    },
    // Scoreboard digits: Barlow Condensed, whose face is the weight (never a fontWeight).
    record: { ...scoreDigits.black, color: c.ink, fontSize: 20, lineHeight: 22 },
    recordNone: { color: c.muted },
    sets: { ...scoreDigits.black, color: c.ink, fontSize: 18, lineHeight: 20 },
    setsNone: { color: c.muted },
    rank: { ...scoreDigits.black, color: c.ink, fontSize: 18, lineHeight: 20 },
    rankingRow: { flexDirection: "row", gap: 12 },
    rankCell: { width: 24, minHeight: 20, alignItems: "center" },

    // Matches
    seasons: { gap: 16 },
    seasonBlock: { gap: 10 },
    seasonRow: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: c.cream },
    seasonHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 44,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
    },
    seasonName: { color: c.ink, fontSize: 16, fontWeight: "800", lineHeight: 21 },
    chevronOpen: { transform: [{ rotate: "180deg" }] },
    group: { gap: 8 },
    groupHead: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 4 },

    // Clubs by season
    clubRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    clubSeason: {
      width: 84,
      color: c.muted,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 20,
      fontVariant: ["tabular-nums"],
    },
    clubNames: { flex: 1, gap: 4 },
    clubName: { color: c.ink, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  });
