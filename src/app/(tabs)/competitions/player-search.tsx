import { type Href, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardGrid } from "@/components/CardGrid";
import { CardLink } from "@/components/CardLink";
import { ChevronRight, RotateCcw, Search, User } from "@/components/icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { Palette } from "@/constants/colors";
import { findPlayers, searchWords } from "@/features/players/name-match";
import { useFieldFocus } from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
import { usePlayerSearch } from "@/hooks/use-players";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const SEARCH_DELAY_MS = 300;

const playerHref = (licence: string): Extract<Href, string> =>
  `/(tabs)/competitions/player?licence=${encodeURIComponent(licence)}`;

export default function PlayerSearchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { columns } = useWebLayout();
  const searchFocus = useFieldFocus();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const searchable = searchWords(debouncedQuery).length > 0;
  const {
    data: rankings,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePlayerSearch(debouncedQuery);
  const players = rankings ? findPlayers(rankings, debouncedQuery) : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        testID="player-search-screen"
      >
        <ScreenHeader
          backLabel={t("player_search.back")}
          eyebrow={t("player_search.eyebrow")}
          title={t("player_search.title")}
          subtitle={t("player_search.subtitle")}
        />

        <View style={styles.body}>
          <View style={[styles.searchBox, searchFocus.focusStyle]}>
            <Search color={colors.muted} size={18} />
            <TextInput
              {...searchFocus.focusProps}
              style={[styles.searchInput, searchFocus.inputStyle]}
              value={query}
              onChangeText={setQuery}
              placeholder={t("player_search.placeholder")}
              placeholderTextColor={colors.muted}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel={t("player_search.label")}
              testID="player-search-input"
            />
          </View>

          {!searchable && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{t("player_search.hint")}</Text>
            </View>
          )}

          {isLoading && (
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
              <Text style={styles.errorTitle}>{t("player_search.error_load")}</Text>
              {error instanceof Error && error.message
                ? <Text style={styles.errorDetail}>{error.message}</Text>
                : null}
              <Pressable
                style={styles.retryButton}
                onPress={() => refetch()}
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

          {isSuccess && players.length === 0 && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{t("player_search.empty")}</Text>
            </View>
          )}

          {players.length > 0 && (
            <View style={styles.results}>
              <Text style={styles.resultsCount} accessibilityLiveRegion="polite">
                {t("player_search.results_count", { count: players.length })}
              </Text>
              <CardGrid columns={columns} style={styles.list}>
                {players.map((player) => (
                  <CardLink
                    key={player.licence}
                    style={styles.card}
                    href={playerHref(player.licence)}
                    accessibilityRole="button"
                    accessibilityLabel={`${player.name}, ${player.club.name}`}
                    accessibilityHint={t("player.open_hint")}
                    testID={`player-result-${player.licence}`}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.cardIcon}>
                        <User color={colors.red} size={18} />
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{player.name}</Text>
                        <Text style={styles.cardMeta}>{player.club.name}</Text>
                      </View>
                      <ChevronRight color={colors.muted} size={18} />
                    </View>
                  </CardLink>
                ))}
              </CardGrid>
            </View>
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

    // Search field
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 16,
    },
    searchInput: {
      flex: 1,
      minHeight: 52,
      color: c.ink,
      fontSize: 16,
      fontWeight: "600",
    },

    // States
    centered: { paddingVertical: 40, alignItems: "center" },
    messageBox: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line,
    },
    messageText: {
      color: c.muted,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
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

    // Results
    results: { gap: 12 },
    resultsCount: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    list: { gap: 12 },
    card: {
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
    },
    cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.redSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: { flex: 1, gap: 2 },
    cardTitle: { color: c.ink, fontSize: 17, fontWeight: "800" },
    cardMeta: { color: c.muted, fontSize: 13, fontWeight: "600" },
  });
