import { router, Stack } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarClock, Check, ChevronRight, MapPin, Plus, UserCheck, X } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

type PlayerStatus = "ok" | "ko" | "disponible";

interface SlotPlayer {
  id: string;
  name: string;
  status: PlayerStatus;
  selected: boolean;
}

const STEPS = ["period", "frequency", "players", "statuses", "selection", "summary"] as const;

// Monday first; 0 = Sunday, as in Date.getDay().
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

// 7 January 2024 is a Sunday, so `weekday` (0 = Sunday) falls on the 7 + weekday.
const weekdayDate = (weekday: number) => new Date(2024, 0, 7 + weekday);

// Intl gives lowercase weekday names in French, Spanish and Basque.
const capitalize = (text: string, locale: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

const STATUSES: PlayerStatus[] = ["ok", "ko", "disponible"];

const STATUS_TONES: Record<PlayerStatus, "green" | "red" | "amber"> = {
  ok: "green",
  ko: "red",
  disponible: "amber",
};

// Mock defaults: the wizard shows them in the active language until the user edits a field.
const DEFAULT_SEASON = "2025–2026";
const DEFAULT_START = new Date(2025, 8, 1);
const DEFAULT_END = new Date(2026, 7, 1);

export default function NewSlotScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const formats = useMemo(
    () => ({
      monthYear: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: "short" }),
    }),
    [locale],
  );
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0 — Période. Null until edited, so the default follows the language.
  const [seasonName, setSeasonName] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const defaultStart = formats.monthYear.format(DEFAULT_START);
  const defaultEnd = formats.monthYear.format(DEFAULT_END);
  const season = seasonName ?? t("slot.season", { season: DEFAULT_SEASON });
  const start = startDate ?? defaultStart;
  const end = endDate ?? defaultEnd;

  // Step 1 — Fréquence
  const [weekday, setWeekday] = useState(4);
  const weekdayLabel = capitalize(formats.weekday.format(weekdayDate(weekday)), locale);
  const [timeFrom, setTimeFrom] = useState("18:00");
  const [timeTo, setTimeTo] = useState("20:00");
  const [venue, setVenue] = useState("Fronton municipal, Biarritz");

  // Step 2 — Joueurs
  const [players, setPlayers] = useState<SlotPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const playerInputRef = useRef<TextInput>(null);

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers((prev) => [
      ...prev,
      { id: String(Date.now()), name, status: "ok", selected: false },
    ]);
    setNewPlayerName("");
    playerInputRef.current?.focus();
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const setStatus = (id: string, status: PlayerStatus) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const toggleSelected = (id: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const goNext = () => setCurrentStep((s) => (s < STEPS.length - 1 ? s + 1 : s));

  const goBack = () => setCurrentStep((s) => (s > 0 ? s - 1 : s));

  const isLastStep = currentStep === STEPS.length - 1;

  const nextLabel = useMemo(() => {
    if (isLastStep) return t("new_slot.cta_create");
    if (currentStep === 2 && players.length === 0) return t("new_slot.cta_skip");
    return t("new_slot.cta_continue");
  }, [currentStep, isLastStep, players.length, t]);

  const handleConfirm = () => {
    router.replace("/(tabs)/slot");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        testID="new-slot-screen"
      >
        <ScreenHeader
          backLabel={currentStep > 0 ? t("common.back") : undefined}
          onBack={goBack}
          title={t("slot.new")}
          subtitle={t("new_slot.subtitle")}
        />

        <View style={styles.body}>
          {/* ── Step indicator ── */}
          <View style={styles.stepsRow}>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    index === currentStep ? styles.stepCircleActive : null,
                    index < currentStep ? styles.stepCircleDone : null,
                  ]}
                >
                  {index < currentStep ? <Check color={colors.red} size={14} /> : (
                    <Text
                      style={[
                        styles.stepText,
                        index === currentStep ? styles.stepTextActive : null,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index === currentStep ? styles.stepLabelActive : null,
                  ]}
                >
                  {t(`new_slot.step_${step}`)}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Form card ── */}
          <View style={styles.formCard}>
            {/* STEP 0 — Période */}
            {currentStep === 0 && (
              <>
                <Text style={styles.stepHeading}>{t("new_slot.period_heading")}</Text>

                <Text style={styles.label}>{t("new_slot.label_season")}</Text>
                <TextInput
                  value={season}
                  onChangeText={setSeasonName}
                  style={styles.input}
                  testID="input-season-name"
                />

                <Text style={styles.label}>{t("new_slot.label_start")}</Text>
                <TextInput
                  value={start}
                  onChangeText={setStartDate}
                  style={styles.input}
                  placeholder={t("new_slot.placeholder_example", { value: defaultStart })}
                  placeholderTextColor={colors.placeholder}
                  testID="input-start-date"
                />

                <Text style={styles.label}>{t("new_slot.label_end")}</Text>
                <TextInput
                  value={end}
                  onChangeText={setEndDate}
                  style={styles.input}
                  placeholder={t("new_slot.placeholder_example", { value: defaultEnd })}
                  placeholderTextColor={colors.placeholder}
                  testID="input-end-date"
                />

                <View style={styles.previewBox}>
                  <CalendarClock color={colors.red} size={16} />
                  <Text style={styles.previewText}>
                    {season || "—"} · {start || "?"} → {end || "?"}
                  </Text>
                </View>
              </>
            )}

            {/* STEP 1 — Fréquence */}
            {currentStep === 1 && (
              <>
                <Text style={styles.stepHeading}>{t("new_slot.frequency_heading")}</Text>

                <Text style={styles.label}>{t("new_slot.label_weekday")}</Text>
                <View style={styles.chipsWrap}>
                  {WEEKDAYS.map((day) => (
                    <PressableScale
                      key={day}
                      onPress={() => setWeekday(day)}
                      accessibilityRole="button"
                      accessibilityLabel={formats.weekday.format(weekdayDate(day))}
                    >
                      <View
                        style={[
                          styles.chip,
                          day === weekday ? styles.chipActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            day === weekday ? styles.chipTextActive : null,
                          ]}
                        >
                          {capitalize(formats.weekdayShort.format(weekdayDate(day)), locale)}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>

                <Text style={styles.label}>{t("new_slot.label_time")}</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    value={timeFrom}
                    onChangeText={setTimeFrom}
                    style={[styles.input, styles.inputHalf]}
                    placeholder="18:00"
                    placeholderTextColor={colors.placeholder}
                    testID="input-time-from"
                  />
                  <Text style={styles.timeSep}>→</Text>
                  <TextInput
                    value={timeTo}
                    onChangeText={setTimeTo}
                    style={[styles.input, styles.inputHalf]}
                    placeholder="20:00"
                    placeholderTextColor={colors.placeholder}
                    testID="input-time-to"
                  />
                </View>

                <Text style={styles.label}>{t("new_slot.label_venue")}</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin color={colors.muted} size={16} />
                  <TextInput
                    value={venue}
                    onChangeText={setVenue}
                    style={styles.inputFlexible}
                    placeholder={t("new_slot.placeholder_venue")}
                    placeholderTextColor={colors.placeholder}
                    testID="input-venue"
                  />
                </View>

                <View style={styles.previewBox}>
                  <CalendarClock color={colors.red} size={16} />
                  <Text style={styles.previewText}>
                    {`${weekdayLabel} · ${timeFrom || "?"} – ${timeTo || "?"}`}
                  </Text>
                </View>
              </>
            )}

            {/* STEP 2 — Joueurs */}
            {currentStep === 2 && (
              <>
                <Text style={styles.stepHeading}>
                  {t("new_slot.players_heading", { total: players.length })}
                </Text>

                <View style={styles.inputWithIcon}>
                  <TextInput
                    ref={playerInputRef}
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    style={styles.inputFlexible}
                    placeholder={t("new_slot.placeholder_player")}
                    placeholderTextColor={colors.placeholder}
                    onSubmitEditing={addPlayer}
                    returnKeyType="done"
                    testID="input-player-name"
                  />
                  <PressableScale
                    onPress={addPlayer}
                    accessibilityRole="button"
                    accessibilityLabel={t("new_slot.add_player")}
                  >
                    <View style={styles.addBtn}>
                      <Plus color={colors.onRedStrong} size={16} />
                    </View>
                  </PressableScale>
                </View>

                {players.length === 0 && (
                  <Text style={styles.emptyHint}>{t("new_slot.players_hint")}</Text>
                )}

                {players.map((p) => (
                  <View key={p.id} style={styles.playerRow}>
                    <View style={styles.playerInitial}>
                      <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <PressableScale
                      onPress={() => removePlayer(p.id)}
                      accessibilityRole="button"
                      accessibilityLabel={t("new_slot.remove_player", { name: p.name })}
                    >
                      <View style={styles.removeBtn}>
                        <X color={colors.muted} size={14} />
                      </View>
                    </PressableScale>
                  </View>
                ))}
              </>
            )}

            {/* STEP 3 — Statuts */}
            {currentStep === 3 && (
              <>
                <Text style={styles.stepHeading}>{t("new_slot.statuses_heading")}</Text>
                <Text style={styles.stepHint}>{t("new_slot.statuses_hint")}</Text>

                {players.length === 0 && (
                  <Text style={styles.emptyHint}>{t("new_slot.no_players")}</Text>
                )}

                {players.map((p) => (
                  <View key={p.id} style={styles.statusRow}>
                    <View style={styles.playerInitial}>
                      <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View style={styles.statusChips}>
                      {STATUSES.map((status) => (
                        <PressableScale
                          key={status}
                          onPress={() => setStatus(p.id, status)}
                          accessibilityRole="button"
                          accessibilityLabel={t(`slot.status.${status}`)}
                          accessibilityState={{ selected: p.status === status }}
                        >
                          <View
                            style={[
                              styles.statusChip,
                              p.status === status
                                ? styles.statusChipActive
                                : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusChipText,
                                p.status === status
                                  ? styles.statusChipTextActive
                                  : null,
                              ]}
                            >
                              {t(`slot.status.${status}`)}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* STEP 4 — Sélection */}
            {currentStep === 4 && (
              <>
                <Text style={styles.stepHeading}>
                  {t("new_slot.selection_heading", {
                    total: players.filter((p) => p.selected).length,
                  })}
                </Text>
                <Text style={styles.stepHint}>{t("new_slot.selection_hint")}</Text>

                {players.length === 0 && (
                  <Text style={styles.emptyHint}>{t("new_slot.no_players")}</Text>
                )}

                {players.map((p) => (
                  <PressableScale
                    key={p.id}
                    onPress={() => toggleSelected(p.id)}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    accessibilityState={{ selected: p.selected }}
                  >
                    <View
                      style={[
                        styles.selectionRow,
                        p.selected ? styles.selectionRowActive : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.playerInitial,
                          p.selected ? styles.playerInitialSelected : null,
                        ]}
                      >
                        {p.selected
                          ? <UserCheck color={colors.cream} size={16} />
                          : <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>}
                      </View>
                      <Text
                        style={[
                          styles.playerName,
                          p.selected ? styles.playerNameSelected : null,
                        ]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                      <StatusPill
                        label={t(`slot.status.${p.status}`)}
                        tone={STATUS_TONES[p.status]}
                      />
                    </View>
                  </PressableScale>
                ))}
              </>
            )}

            {/* STEP 5 — Résumé */}
            {currentStep === 5 && (
              <>
                <Text style={styles.stepHeading}>{t("new_slot.summary_heading")}</Text>

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>{t("new_slot.summary_season")}</Text>
                  <Text style={styles.summaryValue}>{season || "—"}</Text>
                  <Text style={styles.summaryMeta}>
                    {`${start || "?"} → ${end || "?"}`}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>{t("new_slot.summary_slot")}</Text>
                  <Text style={styles.summaryValue}>
                    {`${weekdayLabel} · ${timeFrom}–${timeTo}`}
                  </Text>
                  <View style={styles.summaryRow}>
                    <MapPin color={colors.muted} size={13} />
                    <Text style={styles.summaryMeta}>{venue || "—"}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>
                    {t("new_slot.summary_players", { total: players.length })}
                  </Text>
                  <View style={styles.summaryPlayers}>
                    {players.map((p) => (
                      <View key={p.id} style={styles.summaryPlayer}>
                        <Text style={styles.summaryPlayerName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <StatusPill
                          label={t(`slot.status.${p.status}`)}
                          tone={STATUS_TONES[p.status]}
                        />
                        {p.selected && <UserCheck color={colors.green} size={14} />}
                      </View>
                    ))}
                    {players.length === 0 && (
                      <Text style={styles.emptyHint}>{t("new_slot.summary_no_players")}</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* ── CTA ── */}
            <PressableScale
              onPress={isLastStep ? handleConfirm : goNext}
              testID="new-slot-continue"
              accessibilityRole="button"
              accessibilityLabel={nextLabel}
            >
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nextLabel}</Text>
                {isLastStep
                  ? <Check color={colors.ink} size={18} />
                  : <ChevronRight color={colors.ink} size={18} />}
              </View>
            </PressableScale>
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

    stepsRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
    stepItem: { flex: 1, alignItems: "center", gap: 6 },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      alignItems: "center",
      justifyContent: "center",
    },
    stepCircleActive: { backgroundColor: c.redFill, borderColor: c.redFill },
    stepCircleDone: { backgroundColor: c.redSoft, borderColor: c.redSoft },
    stepText: { color: c.muted, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
    stepTextActive: { color: c.onRedStrong },
    stepLabel: {
      color: c.muted,
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
    },
    stepLabelActive: { color: c.ink },

    formCard: {
      borderRadius: 24,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
      gap: 14,
    },
    stepHeading: {
      color: c.ink,
      fontSize: 20,
      fontWeight: "900",
    },
    stepHint: {
      color: c.muted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: -6,
    },

    label: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.3,
    },
    input: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: c.ink,
      fontWeight: "600",
    },
    inputHalf: { flex: 1 },
    inputWithIcon: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
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
    timeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    timeSep: { color: c.muted, fontSize: 16, fontWeight: "700" },

    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    chipActive: { backgroundColor: c.redSoft, borderColor: c.redSoft },
    chipText: { color: c.ink, fontSize: 14, fontWeight: "700" },
    chipTextActive: { color: c.red },

    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.redFill,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyHint: {
      color: c.muted,
      fontSize: 13,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 8,
    },

    playerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cream,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    playerInitial: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.redSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    playerInitialText: { color: c.red, fontSize: 14, fontWeight: "900" },
    playerInitialSelected: { backgroundColor: c.green },
    playerName: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "700" },
    playerNameSelected: { color: c.green },
    removeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.line,
      alignItems: "center",
      justifyContent: "center",
    },

    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cream,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    statusChips: { flexDirection: "row", gap: 6 },
    statusChip: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusChipActive: { backgroundColor: c.ink, borderColor: c.ink },
    statusChipText: { color: c.muted, fontSize: 12, fontWeight: "700" },
    statusChipTextActive: { color: c.white },

    selectionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cream,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "transparent",
    },
    selectionRowActive: {
      backgroundColor: c.greenSoft,
      borderColor: c.greenSoft,
    },

    previewBox: {
      borderRadius: 14,
      backgroundColor: c.cream,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    previewText: { color: c.ink, fontSize: 14, fontWeight: "700", flex: 1 },

    divider: { height: 1, backgroundColor: c.line },

    summarySection: { gap: 6 },
    summaryLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    summaryValue: { color: c.ink, fontSize: 17, fontWeight: "900" },
    summaryMeta: { color: c.muted, fontSize: 13 },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    summaryPlayers: { gap: 8 },
    summaryPlayer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cream,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    summaryPlayerName: {
      flex: 1,
      color: c.ink,
      fontSize: 14,
      fontWeight: "700",
    },

    ctaButton: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 18,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    ctaText: { color: c.ink, fontSize: 16, fontWeight: "800" },
  });
