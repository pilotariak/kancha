import { router } from "expo-router";
import { ChevronRight, Shield } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { KanchaColors } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { useLeagueStore } from "@/store/league-store";

export default function LeaguePickerScreen() {
  const { t } = useTranslation();
  const setLeague = useLeagueStore((s) => s.setLeague);

  function handleSelect(id: string) {
    setLeague(id);
    router.push("/(tabs)/competitions/list");
  }

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="league-picker-screen"
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{t("leagues.eyebrow")}</Text>
            <Text style={styles.title}>{t("leagues.title")}</Text>
            <Text style={styles.subtitle}>{t("leagues.subtitle")}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>{t("common.choose")}</Text>
            <Text style={styles.sectionTitle}>{t("leagues.your_league")}</Text>
          </View>

          <View style={styles.list}>
            {LEAGUES.map((league) => (
              <Pressable
                key={league.id}
                style={[styles.card, !league.supported && styles.cardDisabled]}
                onPress={() => league.supported && handleSelect(league.id)}
                disabled={!league.supported}
                testID={`league-card-${league.id}`}
              >
                <View style={[styles.cardIcon, !league.supported && styles.cardIconDisabled]}>
                  <Shield
                    color={league.supported ? KanchaColors.red : KanchaColors.muted}
                    size={18}
                  />
                </View>
                <Text style={[styles.cardTitle, !league.supported && styles.cardTitleDisabled]}>
                  {league.name}
                </Text>
                {league.supported
                  ? <ChevronRight color={KanchaColors.muted} size={18} />
                  : <Text style={styles.comingSoon}>{t("common.soon")}</Text>}
              </Pressable>
            ))}
          </View>
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
  section: { gap: 4 },
  sectionEyebrow: {
    color: KanchaColors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  sectionTitle: { color: KanchaColors.ink, fontSize: 28, fontWeight: "900" },
  list: { gap: 12 },
  card: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDisabled: {
    backgroundColor: "rgba(247,244,239,0.5)",
    borderColor: "rgba(229,222,214,0.5)",
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: KanchaColors.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconDisabled: {
    backgroundColor: "rgba(229,222,214,0.6)",
  },
  cardTitle: { color: KanchaColors.ink, fontSize: 16, fontWeight: "800", flex: 1 },
  cardTitleDisabled: { color: KanchaColors.muted },
  comingSoon: {
    fontSize: 11,
    fontWeight: "700",
    color: KanchaColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
