import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronRight, Shield } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { useLeagueStore } from "@/store/league-store";

export default function LeaguePickerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const setLeague = useLeagueStore((s) => s.setLeague);

  function handleSelect(id: string) {
    setLeague(id);
    router.push("/(tabs)/competitions/list");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="league-picker-screen"
      >
        <ScreenHeader
          eyebrow={t("leagues.eyebrow")}
          title={t("leagues.title")}
          subtitle={t("leagues.subtitle")}
        />

        <View style={styles.body}>
          <SectionHeader eyebrow={t("common.choose")} title={t("leagues.your_league")} />

          <View style={styles.list}>
            {LEAGUES.map((league) => (
              <PressableScale
                key={league.id}
                style={[styles.card, !league.supported && styles.cardDisabled]}
                onPress={() => league.supported && handleSelect(league.id)}
                disabled={!league.supported}
                accessibilityRole="button"
                accessibilityState={{ disabled: !league.supported }}
                accessibilityLabel={league.supported
                  ? league.name
                  : `${league.name}, ${t("common.soon")}`}
                accessibilityHint={league.supported ? t("leagues.open_hint") : undefined}
                testID={`league-card-${league.id}`}
              >
                <View style={[styles.cardIcon, !league.supported && styles.cardIconDisabled]}>
                  <Shield
                    color={league.supported ? colors.red : colors.muted}
                    size={18}
                  />
                </View>
                <Text style={[styles.cardTitle, !league.supported && styles.cardTitleDisabled]}>
                  {league.name}
                </Text>
                {league.supported
                  ? <ChevronRight color={colors.muted} size={18} />
                  : <Text style={styles.comingSoon}>{t("common.soon")}</Text>}
              </PressableScale>
            ))}
          </View>
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
    list: { gap: 12 },
    card: {
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardDisabled: {
      backgroundColor: c.cream,
      borderColor: c.line,
      opacity: 0.6,
    },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.redSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    cardIconDisabled: {
      backgroundColor: c.line,
    },
    cardTitle: { color: c.ink, fontSize: 18, fontWeight: "800", flex: 1 },
    cardTitleDisabled: { color: c.muted },
    comingSoon: {
      fontSize: 11,
      fontWeight: "700",
      color: c.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
  });
