import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronRight, Search } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { useCompetitions } from "@/hooks/use-competitions";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { useLeagueStore } from "@/store/league-store";

export default function CompetitionsListScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { data: competitions, isPending, isError, error } = useCompetitions();
  const selectedLeagueId = useLeagueStore((s) => s.selectedLeagueId);

  const league = LEAGUES.find((l) => l.id === selectedLeagueId);
  const list = competitions ?? [];

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

        <View style={styles.body}>
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

          {list.length > 0 && (
            <>
              <SectionHeader
                eyebrow={t("competitions.all_eyebrow")}
                title={t("competitions.season_title")}
                subtitle={t("competitions.season_subtitle")}
              />
              <View style={styles.list}>
                {list.map((item) => (
                  <PressableScale
                    key={item.id}
                    style={styles.card}
                    onPress={() => router.push(`/(tabs)/competitions/details?id=${item.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={[item.name, item.level, item.year].filter(Boolean).join(
                      ", ",
                    )}
                    testID={`competition-card-${item.id}`}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      {item.level && <Text style={styles.cardLevel}>{item.level}</Text>}
                    </View>
                    {item.year != null && <Text style={styles.cardMeta}>{item.year}</Text>}
                  </PressableScale>
                ))}
              </View>
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
  });
