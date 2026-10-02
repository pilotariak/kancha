import { Stack } from "expo-router";
import { CalendarDays, ChevronRight, Users2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const disciplines = [
  "Main nue",
  "Chistera",
  "Pala",
  "Rebot",
  "Grand chistera",
] as const;
const categories = ["Senior", "Junior", "Veteran", "Women"] as const;
const formats = [
  "Pools + bracket",
  "Straight knockout",
  "Round robin",
] as const;

export default function NewCompetitionScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const stepTitles = [
    t("new_competition.step_info"),
    t("new_competition.step_format"),
    t("new_competition.step_players"),
    t("new_competition.step_schedule"),
    t("new_competition.step_summary"),
  ];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>("Txapelketa Bayonne 2026");
  const [date, setDate] = useState<string>("12/04/2026");
  const [venue, setVenue] = useState<string>("Fronton municipal, Bayonne");
  const [discipline, setDiscipline] = useState<string>("Main nue");
  const [category, setCategory] = useState<string>("Senior");
  const [format, setFormat] = useState<string>("Pools + bracket");
  const [playerCount] = useState<string>("14 teams");

  const nextLabel = useMemo(
    () =>
      currentStep === stepTitles.length - 1
        ? t("new_competition.cta_ready")
        : t("new_competition.cta_continue"),
    [currentStep, t],
  );

  const goNext = () => {
    setCurrentStep((value) => value < stepTitles.length - 1 ? value + 1 : value);
  };

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="new-competition-screen"
        >
          <View style={styles.hero}>
            <Text style={styles.title} accessibilityRole="header">
              {t("new_competition.title")}
            </Text>
            <Text style={styles.subtitle}>{t("new_competition.subtitle")}</Text>
          </View>

          <View style={styles.stepsRow}>
            {stepTitles.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    index === currentStep ? styles.stepCircleActive : null,
                    index < currentStep ? styles.stepCircleDone : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      index === currentStep ? styles.stepTextActive : null,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index === currentStep ? styles.stepLabelActive : null,
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>{t("new_competition.label_name")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              testID="input-competition-name"
            />

            <Text style={styles.label}>{t("new_competition.label_date")}</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={date}
                onChangeText={setDate}
                style={styles.inputFlexible}
                testID="input-competition-date"
              />
              <CalendarDays color={colors.ink} size={18} />
            </View>

            <Text style={styles.label}>{t("new_competition.label_venue")}</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              style={styles.input}
              testID="input-competition-venue"
            />

            <Text style={styles.label}>{t("new_competition.label_discipline")}</Text>
            <View style={styles.chipsWrap}>
              {disciplines.map((item) => (
                <PressableScale
                  key={item}
                  onPress={() => setDiscipline(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                >
                  <View
                    style={[
                      styles.chip,
                      item === discipline ? styles.chipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        item === discipline ? styles.chipTextActive : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </View>

            <Text style={styles.label}>{t("new_competition.label_category")}</Text>
            <View style={styles.chipsWrap}>
              {categories.map((item) => (
                <PressableScale
                  key={item}
                  onPress={() => setCategory(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                >
                  <View
                    style={[
                      styles.chip,
                      item === category ? styles.chipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        item === category ? styles.chipTextActive : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </View>

            <Text style={styles.label}>{t("new_competition.label_format")}</Text>
            <View style={styles.chipsWrap}>
              {formats.map((item) => (
                <PressableScale
                  key={item}
                  onPress={() => setFormat(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                >
                  <View
                    style={[
                      styles.chip,
                      item === format ? styles.chipActiveDark : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        item === format ? styles.chipTextDark : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Users2 color={colors.red} size={16} />
                <Text style={styles.summaryText}>{playerCount}</Text>
                <StatusPill label={t("new_competition.seeded")} tone="green" />
              </View>
              <Text style={styles.summaryMeta}>{t("new_competition.schedule_meta")}</Text>
            </View>

            <PressableScale
              onPress={goNext}
              testID="new-competition-continue"
              accessibilityRole="button"
              accessibilityLabel={nextLabel}
            >
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nextLabel}</Text>
                <ChevronRight color={colors.ink} size={18} />
              </View>
            </PressableScale>
          </View>
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
    hero: { gap: 6 },
    title: { color: "#FFFFFF", fontSize: 32, fontWeight: "900" },
    subtitle: {
      color: "rgba(255,255,255,0.82)",
      fontSize: 14,
      lineHeight: 20,
      maxWidth: 310,
    },
    stepsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    stepItem: { flex: 1, alignItems: "center", gap: 8 },
    stepCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    stepCircleActive: { backgroundColor: c.white },
    stepCircleDone: { backgroundColor: "#F6C0C9" },
    stepText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
    stepTextActive: { color: c.red },
    stepLabel: {
      color: "rgba(255,255,255,0.76)",
      fontSize: 11,
      fontWeight: "700",
    },
    stepLabelActive: { color: "#FFFFFF" },
    formCard: {
      borderRadius: 24,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
      gap: 14,
    },
    label: {
      color: "#8E857C",
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.3,
    },
    input: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#D8CFC6",
      backgroundColor: c.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: c.ink,
      fontWeight: "600",
    },
    inputWithIcon: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#D8CFC6",
      backgroundColor: c.white,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    inputFlexible: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: c.ink,
      fontWeight: "600",
    },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#D8CFC6",
      backgroundColor: c.white,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    chipActive: { backgroundColor: c.redSoft, borderColor: "#F1B9C4" },
    chipActiveDark: { backgroundColor: "#1B1B1B", borderColor: "#1B1B1B" },
    chipText: { color: c.ink, fontSize: 15, fontWeight: "700" },
    chipTextActive: { color: c.redDark },
    chipTextDark: { color: "#FFFFFF" },
    summaryCard: {
      borderRadius: 18,
      backgroundColor: "#F5EEE6",
      padding: 16,
      gap: 10,
    },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    summaryText: {
      flex: 1,
      color: c.ink,
      fontSize: 15,
      fontWeight: "800",
    },
    summaryMeta: { color: "#6E655C", fontSize: 13, lineHeight: 18 },
    ctaButton: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: "#D8CFC6",
      paddingHorizontal: 18,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    ctaText: { color: c.ink, fontSize: 16, fontWeight: "800" },
  });
