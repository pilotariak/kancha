import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeaturedCard } from "@/components/FeaturedCard";
import { ChevronDown, ChevronRight, ChevronUp, Search } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SeasonTile } from "@/components/SeasonTile";
import { SectionHeader } from "@/components/SectionHeader";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import {
  formatSeason,
  groupBySeason,
  keepSeasonTogether,
  type SeasonGroup,
  splitPreviousSeasons,
  toSeasonBlocks,
} from "@/features/competitions/seasons";
import { useCompetitions } from "@/hooks/use-competitions";
import { useContentColumn } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { useLeagueStore } from "@/store/league-store";
import type { Competition } from "@/types/competition";

const openCompetition = (id: string) => router.push(`/(tabs)/competitions/details?id=${id}`);

interface Tile {
  competition: Competition;
  eyebrow?: string;
  title: string;
}

export default function CompetitionsListScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const column = useContentColumn();
  const { data: competitions, isPending, isError, error } = useCompetitions();
  const selectedLeagueId = useLeagueStore((s) => s.selectedLeagueId);
  const [expanded, setExpanded] = useState(false);

  const league = LEAGUES.find((l) => l.id === selectedLeagueId);
  const list = useMemo(() => competitions ?? [], [competitions]);
  const seasons = useMemo(() => groupBySeason(list), [list]);

  const renderCard = (item: Competition) => (
    <PressableScale
      key={item.id}
      style={styles.card}
      onPress={() => openCompetition(item.id)}
      accessibilityRole="button"
      accessibilityLabel={[item.name, item.level, item.year].filter(Boolean).join(", ")}
      testID={`competition-card-${item.id}`}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{keepSeasonTogether(item.name)}</Text>
        {item.level && <Text style={styles.cardLevel}>{item.level}</Text>}
      </View>
      {item.year != null && <Text style={styles.cardMeta}>{item.year}</Text>}
    </PressableScale>
  );

  // Two tiles per row, each in a cell without padding, so an odd last tile keeps its half
  // width next to the empty cell.
  const renderTiles = (tiles: Tile[], variant: "season" | "name") => {
    const rows: Tile[][] = [];
    for (let i = 0; i < tiles.length; i += 2) rows.push(tiles.slice(i, i + 2));
    return rows.map((row) => (
      <View key={row[0].competition.id} style={styles.gridRow}>
        {row.map((tile) => (
          <View key={tile.competition.id} style={styles.gridCell}>
            <SeasonTile
              eyebrow={tile.eyebrow}
              title={tile.title}
              variant={variant}
              onPress={() => openCompetition(tile.competition.id)}
              accessibilityLabel={tile.competition.name}
              testID={`competition-card-${tile.competition.id}`}
            />
          </View>
        ))}
        {row.length === 1 && <View style={styles.gridCell} />}
      </View>
    ));
  };

  const renderSeasonGrid = (groups: SeasonGroup[]) =>
    toSeasonBlocks(groups).map((block) =>
      block.kind === "seasons"
        ? (
          <View key={`seasons-${block.groups[0].season.start}`} style={styles.grid}>
            {renderTiles(
              block.groups.map(({ season, competitions: [{ competition, label }] }) => ({
                competition,
                eyebrow: label,
                title: formatSeason(season),
              })),
              "season",
            )}
          </View>
        )
        : (
          <View key={`season-${block.group.season.start}`} style={styles.grid}>
            <Text style={styles.seasonHeading} accessibilityRole="header">
              {t("competitions.season_heading", { season: formatSeason(block.group.season) })}
            </Text>
            {renderTiles(
              block.group.competitions.map(({ competition, label }) => ({
                competition,
                title: label,
              })),
              "name",
            )}
          </View>
        )
    );

  const renderSeasons = () => {
    if (!seasons) return null;
    const [lead, ...rest] = seasons.current.competitions;
    const { shown, hidden } = splitPreviousSeasons(seasons.previous);

    return (
      <>
        <View style={styles.list}>
          <FeaturedCard
            eyebrow={t("competitions.current_season")}
            title={keepSeasonTogether(lead.competition.name)}
            footer={t("competitions.see_results")}
            onPress={() => openCompetition(lead.competition.id)}
            testID={`competition-card-${lead.competition.id}`}
          />
          {rest.map(({ competition }) => renderCard(competition))}
        </View>

        {shown.length > 0 && (
          <>
            <SectionHeader
              eyebrow={t("competitions.previous_eyebrow")}
              title={t("competitions.previous_title")}
            />
            <View style={styles.list}>
              {renderSeasonGrid(expanded ? seasons.previous : shown)}
              {hidden.length > 0 && (
                <Pressable
                  style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
                  onPress={() => setExpanded((value) => !value)}
                  accessibilityRole="button"
                  aria-expanded={expanded}
                  testID="all-seasons-toggle"
                >
                  <Text style={styles.toggleLabel}>
                    {expanded ? t("competitions.fewer_seasons") : t("competitions.all_seasons")}
                  </Text>
                  {expanded
                    ? <ChevronUp color={colors.ink} size={18} />
                    : <ChevronDown color={colors.ink} size={18} />}
                </Pressable>
              )}
            </View>
          </>
        )}

        {seasons.others.length > 0 && (
          <>
            <SectionHeader
              eyebrow={t("competitions.others_eyebrow")}
              title={t("competitions.others_title")}
            />
            <View style={styles.list}>{seasons.others.map(renderCard)}</View>
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="competitions-screen"
      >
        <ScreenHeader
          backLabel={t("competitions.back")}
          eyebrow={t("competitions.eyebrow")}
          title={t("competitions.title")}
          subtitle={league?.name}
        />

        <View style={[styles.body, column]}>
          <PressableScale
            style={[styles.card, styles.searchRow]}
            onPress={() => router.push("/(tabs)/competitions/player-search")}
            accessibilityRole="button"
            accessibilityLabel={t("competitions.find_player")}
            accessibilityHint={t("competitions.find_player_subtitle")}
            testID="find-player-card"
          >
            <View style={styles.searchIcon}>
              <Search color={colors.red} size={18} />
            </View>
            <View style={styles.searchBody}>
              <Text style={styles.cardTitle}>{t("competitions.find_player")}</Text>
              <Text style={styles.cardMeta}>{t("competitions.find_player_subtitle")}</Text>
            </View>
            <ChevronRight color={colors.muted} size={18} />
          </PressableScale>

          {isPending && (
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
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : t("competitions.error_load")}
              </Text>
            </View>
          )}

          {!isPending && !isError && list.length === 0 && (
            <View style={styles.emptyBox} testID="competitions-empty">
              <Text style={styles.emptyText}>{t("competitions.empty")}</Text>
            </View>
          )}

          {seasons ? renderSeasons() : list.length > 0 && (
            <>
              <SectionHeader
                eyebrow={t("competitions.all_eyebrow")}
                title={t("competitions.season_title")}
                subtitle={t("competitions.season_subtitle")}
              />
              <View style={styles.list}>{list.map(renderCard)}</View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120 },
    body: { paddingHorizontal: 20, paddingTop: 22, gap: 22 },
    centered: {
      paddingVertical: 60,
      alignItems: "center",
    },
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
      borderWidth: 1,
      borderColor: c.line,
      alignItems: "center",
    },
    emptyText: { color: c.muted, fontSize: 14, fontWeight: "600", textAlign: "center" },
    list: { gap: 12 },
    card: {
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
      gap: 8,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    cardTitle: { color: c.ink, fontSize: 18, fontWeight: "800", flex: 1 },
    cardLevel: { color: c.muted, fontSize: 13, fontWeight: "600" },
    cardMeta: { color: c.muted, fontSize: 13 },
    searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    searchIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.redSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBody: { flex: 1, gap: 2 },
    grid: { gap: 12 },
    gridRow: { flexDirection: "row", gap: 12 },
    gridCell: { flex: 1 },
    seasonHeading: {
      color: c.ink,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 4,
    },
    toggle: {
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
