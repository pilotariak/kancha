import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronRight } from "@/components/icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import type { Palette } from "@/constants/colors";
import { useCompetition } from "@/hooks/use-competitions";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

export default function SpecialtyPickerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: competition, isPending: loadingComp } = useCompetition(id ?? "");
  const { data: specialties, isPending: loadingSpecialties, isError } = useSpecialties();

  function handleSelect(specialtyId: string) {
    router.push(`/(tabs)/competitions/category?id=${id}&specialtyId=${specialtyId}`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="specialty-picker-screen"
      >
        <ScreenHeader
          backLabel={t("specialty.back")}
          title={competition?.name ?? t("common.competition_fallback")}
          subtitle={[competition?.year, competition?.level].filter(Boolean).join(" · ")}
          loading={loadingComp}
        />

        <View style={styles.body}>
          <SectionHeader
            eyebrow={t("common.choose")}
            title={t("specialty.title")}
            subtitle={t("specialty.subtitle")}
          />

          {loadingSpecialties && (
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
              <Text style={styles.errorText}>{t("specialty.error_load")}</Text>
            </View>
          )}

          {!loadingSpecialties && !isError && specialties && (
            <View style={styles.list}>
              {specialties.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.card}
                  onPress={() => handleSelect(s.id)}
                  accessibilityRole="button"
                  accessibilityLabel={s.name}
                  testID={`specialty-card-${s.id}`}
                >
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <ChevronRight color={colors.muted} size={18} />
                </Pressable>
              ))}
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
    centered: { paddingVertical: 40, alignItems: "center" },
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardTitle: { color: c.ink, fontSize: 17, fontWeight: "800", flex: 1 },
  });
