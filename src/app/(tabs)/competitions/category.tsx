import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronRight } from "@/components/icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import type { Palette } from "@/constants/colors";
import { useCategories } from "@/hooks/use-categories";
import { useCompetition } from "@/hooks/use-competitions";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

export default function CategoryPickerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { id, specialtyId } = useLocalSearchParams<{ id: string; specialtyId: string }>();

  const { data: competition, isPending: loadingComp } = useCompetition(id ?? "");
  const { data: specialties } = useSpecialties();
  const { data: categories, isPending: loadingCategories, isError, error } = useCategories();

  const specialtyName = specialties?.find((s) => s.id === specialtyId)?.name;

  function handleSelect(categoryId: string) {
    router.push(
      `/(tabs)/competitions/details?id=${id}&specialtyId=${specialtyId}&categoryId=${categoryId}`,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="category-picker-screen"
      >
        <ScreenHeader
          backLabel={t("category.back")}
          eyebrow={specialtyName}
          title={competition?.name ?? t("common.competition_fallback")}
          subtitle={[competition?.year, competition?.level].filter(Boolean).join(" · ")}
          loading={loadingComp}
        />

        <View style={styles.body}>
          <SectionHeader
            eyebrow={t("common.choose")}
            title={t("category.title")}
            subtitle={t("category.subtitle")}
          />

          {loadingCategories && (
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
                {error instanceof Error ? error.message : t("category.error_load")}
              </Text>
            </View>
          )}

          {!loadingCategories && !isError && categories && categories.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t("category.empty")}</Text>
            </View>
          )}

          {!loadingCategories && !isError && categories && categories.length > 0 && (
            <View style={styles.list}>
              {[...categories]
                .sort((a, b) => {
                  const aIsSerie = a.name.includes("Série");
                  const bIsSerie = b.name.includes("Série");
                  if (aIsSerie && !bIsSerie) {
                    return -1;
                  }
                  if (!aIsSerie && bIsSerie) {
                    return 1;
                  }
                  return 0;
                })
                .map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={styles.card}
                    onPress={() => handleSelect(cat.id)}
                    accessibilityRole="button"
                    accessibilityLabel={cat.name}
                    testID={`category-card-${cat.id}`}
                  >
                    <Text style={styles.cardTitle}>{cat.name}</Text>
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
    emptyBox: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line,
    },
    emptyText: {
      color: c.muted,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
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
