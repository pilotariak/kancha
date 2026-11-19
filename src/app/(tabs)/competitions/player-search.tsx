import { router, Stack } from "expo-router";
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

import { ArrowLeft, ChevronRight, RotateCcw, Search, User } from "@/components/icons";
import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import type { Palette } from "@/constants/colors";
import { findPlayers, searchWords } from "@/features/players/name-match";
import { usePlayerSearch } from "@/hooks/use-players";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const SEARCH_DELAY_MS = 300;

export default function PlayerSearchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID="player-search-screen"
        >
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("player_search.back")}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
            <Text style={styles.backLabel}>{t("player_search.back")}</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{t("player_search.eyebrow")}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {t("player_search.title")}
            </Text>
            <Text style={styles.subtitle}>{t("player_search.subtitle")}</Text>
          </View>

          <View style={styles.searchBox}>
            <Search color={colors.muted} size={18} />
            <TextInput
              style={styles.searchInput}
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
              <View style={styles.list}>
                {players.map((player) => (
                  <PressableScale
                    key={player.licence}
                    style={styles.card}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/competitions/player",
                        params: { licence: player.licence },
                      })}
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
                  </PressableScale>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
    backLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
    hero: { gap: 6 },
    eyebrow: {
      color: c.onRedSoft,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    title: { color: "#FFFFFF", fontSize: 34, fontWeight: "900" },
    subtitle: { color: c.onRedStrong, fontSize: 14, lineHeight: 20 },

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
