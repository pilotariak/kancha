import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { KanchaColors } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { useCompetitions } from "@/hooks/use-competitions";
import { useLeagueStore } from "@/store/league-store";

export default function CompetitionsListScreen() {
  const { t } = useTranslation();
  const { data: competitions, isPending, isError, error } = useCompetitions();
  const selectedLeagueId = useLeagueStore((s) => s.selectedLeagueId);

  const league = LEAGUES.find((l) => l.id === selectedLeagueId);
  const list = competitions ?? [];

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="competitions-screen"
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={KanchaColors.white} size={20} />
            <Text style={styles.backLabel}>{t("competitions.back")}</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{t("competitions.eyebrow")}</Text>
            <Text style={styles.title}>{t("competitions.title")}</Text>
            {league && <Text style={styles.subtitle}>{league.name}</Text>}
          </View>

          {isPending && (
            <View style={styles.centered}>
              <ActivityIndicator color={KanchaColors.white} size="large" />
            </View>
          )}

          {isError && (
            <View style={styles.errorBox}>
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
                    onPress={() => router.push(`/(tabs)/competitions/specialty?id=${item.id}`)}
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
        </ScrollView>
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
  hero: { gap: 6 },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: KanchaColors.white, fontSize: 34, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 20 },
  centered: {
    paddingVertical: 60,
    alignItems: "center",
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: "rgba(255,60,60,0.15)",
    padding: 16,
  },
  errorText: {
    color: KanchaColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  list: { gap: 12 },
  card: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { color: KanchaColors.ink, fontSize: 18, fontWeight: "800", flex: 1 },
  cardLevel: { color: KanchaColors.muted, fontSize: 13, fontWeight: "600" },
  cardMeta: { color: KanchaColors.muted, fontSize: 13 },
});
