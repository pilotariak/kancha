import { Stack } from "expo-router";
import { CalendarDays, ChevronRight, Users2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";

const stepTitles = [
  "Info",
  "Format",
  "Players",
  "Schedule",
  "Summary",
] as const;
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

export default function NewTournamentScreen() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState<string>("Txapelketa Bayonne 2026");
  const [date, setDate] = useState<string>("12/04/2026");
  const [venue, setVenue] = useState<string>("Fronton municipal, Bayonne");
  const [discipline, setDiscipline] = useState<string>("Main nue");
  const [category, setCategory] = useState<string>("Senior");
  const [format, setFormat] = useState<string>("Pools + bracket");
  const [playerCount] = useState<string>("14 teams");

  const nextLabel = useMemo(
    () => currentStep === stepTitles.length - 1 ? "Tournament ready" : "Continue",
    [currentStep],
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
          testID="new-tournament-screen"
        >
          <View style={styles.hero}>
            <Text style={styles.title}>New tournament</Text>
            <Text style={styles.subtitle}>
              A guided setup flow for format, players, scheduling, and standings.
            </Text>
          </View>

          <View style={styles.stepsRow}>
            {stepTitles.map((step, index) => (
              <View key={step} style={styles.stepItem}>
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
            <Text style={styles.label}>Tournament name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              testID="input-tournament-name"
            />

            <Text style={styles.label}>Start date</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                value={date}
                onChangeText={setDate}
                style={styles.inputFlexible}
                testID="input-tournament-date"
              />
              <CalendarDays color={KanchaColors.ink} size={18} />
            </View>

            <Text style={styles.label}>Venue</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              style={styles.input}
              testID="input-tournament-venue"
            />

            <Text style={styles.label}>Discipline</Text>
            <View style={styles.chipsWrap}>
              {disciplines.map((item) => (
                <PressableScale
                  key={item}
                  onPress={() => setDiscipline(item)}
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

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipsWrap}>
              {categories.map((item) => (
                <PressableScale
                  key={item}
                  onPress={() => setCategory(item)}
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

            <Text style={styles.label}>Format</Text>
            <View style={styles.chipsWrap}>
              {formats.map((item) => (
                <PressableScale key={item} onPress={() => setFormat(item)}>
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
                <Users2 color={KanchaColors.red} size={16} />
                <Text style={styles.summaryText}>{playerCount}</Text>
                <StatusPill label="Seeded" tone="green" />
              </View>
              <Text style={styles.summaryMeta}>
                Schedule mode: auto-generated court rotation with standings tracking.
              </Text>
            </View>

            <PressableScale onPress={goNext} testID="new-tournament-continue">
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nextLabel}</Text>
                <ChevronRight color={KanchaColors.ink} size={18} />
              </View>
            </PressableScale>
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
  title: { color: KanchaColors.white, fontSize: 32, fontWeight: "900" },
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
  stepCircleActive: { backgroundColor: KanchaColors.white },
  stepCircleDone: { backgroundColor: "#F6C0C9" },
  stepText: { color: KanchaColors.white, fontSize: 14, fontWeight: "800" },
  stepTextActive: { color: KanchaColors.red },
  stepLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "700",
  },
  stepLabelActive: { color: KanchaColors.white },
  formCard: {
    borderRadius: 24,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
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
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: KanchaColors.ink,
    fontWeight: "600",
  },
  inputWithIcon: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputFlexible: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: KanchaColors.ink,
    fontWeight: "600",
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipActive: { backgroundColor: KanchaColors.redSoft, borderColor: "#F1B9C4" },
  chipActiveDark: { backgroundColor: "#1B1B1B", borderColor: "#1B1B1B" },
  chipText: { color: KanchaColors.ink, fontSize: 15, fontWeight: "700" },
  chipTextActive: { color: KanchaColors.redDark },
  chipTextDark: { color: KanchaColors.white },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: "#F5EEE6",
    padding: 16,
    gap: 10,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  summaryMeta: { color: "#6E655C", fontSize: 13, lineHeight: 18 },
  ctaButton: {
    borderRadius: 16,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: KanchaColors.ink, fontSize: 16, fontWeight: "800" },
});
