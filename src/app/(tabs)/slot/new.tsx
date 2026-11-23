import { router, Stack } from "expo-router";
import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarClock, Check, ChevronRight, MapPin, Minus, Plus, Users } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { selectOnSpace } from "@/components/SegmentedControl";
import type { Palette } from "@/constants/colors";
import {
  type CivilDate,
  defaultSeason,
  ISO_WEEKDAYS,
  type IsoWeekday,
  localToday,
  parseDateInput,
  toIsoDate,
  weekdayName,
} from "@/features/slots/dates";
import { slotErrorMessage } from "@/features/slots/errors";
import { capitalize, dateNames, formatDay, formatLongDate } from "@/features/slots/format";
import {
  COURTS,
  defaultDraft,
  type DraftError,
  firstInvalidStep,
  firstSession,
  firstSessionChoices,
  INTERVALS,
  LIMITS,
  parseTimeInput,
  type SlotDraft,
  SPECIALTIES,
  stepErrors,
  toCreateSlot,
  withMinPlayers,
  withPlaces,
  WIZARD_STEPS,
} from "@/features/slots/wizard";
import { useFieldFocus } from "@/hooks/use-interaction-styles";
import { useCreateSlot } from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

// ── Form parts ────────────────────────────────────────────────────────────────

function Field(
  { label, hint, error, children }: {
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
  },
) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error
        ? <Text style={styles.fieldError} accessibilityRole="alert">{error}</Text>
        : hint
        ? <Text style={styles.hint}>{hint}</Text>
        : null}
    </View>
  );
}

/** One choice among a few: a row of chips, read as radio buttons. */
function Choices<T extends string | number>(
  { label, options, value, onChange, render, describe }: {
    label: string;
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
    render: (value: T) => string;
    /** The accessible name when the chip shows an abbreviation. */
    describe?: (value: T) => string;
  },
) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.chipsWrap} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <PressableScale
            key={String(option)}
            onPress={() => onChange(option)}
            {...selectOnSpace(() => onChange(option))}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={describe ? describe(option) : render(option)}
          >
            <View style={[styles.chip, selected ? styles.chipActive : null]}>
              <Text style={[styles.chipText, selected ? styles.chipTextActive : null]}>
                {render(option)}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

/**
 * A number with − and + buttons. A button at its bound stays focusable, marked disabled, and
 * does nothing: disabling a focused Pressable would drop the keyboard focus on web.
 */
function Stepper(
  { label, value, min, max, onChange, display }: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    display?: string;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View style={styles.stepper}>
      <PressableScale
        onPress={() => !atMin && onChange(value - 1)}
        accessibilityRole="button"
        accessibilityLabel={t("new_slot.decrease", { label })}
        aria-disabled={atMin}
      >
        <View style={[styles.stepperButton, atMin ? styles.stepperButtonOff : null]}>
          <Minus color={atMin ? colors.muted : colors.ink} size={18} />
        </View>
      </PressableScale>
      <Text
        style={styles.stepperValue}
        aria-live="polite"
        accessibilityLabel={`${label}: ${display ?? value}`}
      >
        {display ?? value}
      </Text>
      <PressableScale
        onPress={() => !atMax && onChange(value + 1)}
        accessibilityRole="button"
        accessibilityLabel={t("new_slot.increase", { label })}
        aria-disabled={atMax}
      >
        <View style={[styles.stepperButton, atMax ? styles.stepperButtonOff : null]}>
          <Plus color={atMax ? colors.muted : colors.ink} size={18} />
        </View>
      </PressableScale>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NewSlotScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const names = useMemo(() => dateNames(t), [t]);

  const nameFocus = useFieldFocus();
  const venueFocus = useFieldFocus();
  const startFocus = useFieldFocus();
  const endFocus = useFieldFocus();
  const timeFromFocus = useFieldFocus();
  const timeToFocus = useFieldFocus();
  const deadlineFocus = useFieldFocus();
  const organizerFocus = useFieldFocus();

  // The defaults depend on today's date: set after the mount, so the static web HTML, rendered
  // at build time, hydrates with the same tree.
  const [today, setToday] = useState<CivilDate | null>(null);
  const [draft, setDraft] = useState<SlotDraft | null>(null);
  useEffect(() => {
    const now = localToday();
    setToday(now);
    setDraft(defaultDraft(defaultSeason(now)));
  }, []);

  const [stepIndex, setStepIndex] = useState(0);
  const step = WIZARD_STEPS[stepIndex];
  // A step shows its errors once Continue was pressed on it.
  const [attempted, setAttempted] = useState(false);
  const createSlot = useCreateSlot();

  const errors = useMemo(
    () => (draft && today && attempted ? stepErrors(draft, step, today) : {}),
    [draft, today, attempted, step],
  );
  const errorText = (error?: DraftError) =>
    error ? t(`new_slot.errors.${error.code}`, { min: error.min, max: error.max }) : undefined;

  const update = (changes: Partial<SlotDraft>) => setDraft((d) => (d ? { ...d, ...changes } : d));

  const goTo = (index: number) => {
    setAttempted(false);
    setStepIndex(index);
  };
  const goBack = () => goTo(Math.max(stepIndex - 1, 0));
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  const onContinue = () => {
    if (!draft || !today) return;
    if (Object.keys(stepErrors(draft, step, today)).length > 0) {
      setAttempted(true);
      return;
    }
    goTo(stepIndex + 1);
  };

  const onCreate = () => {
    if (!draft || !today || createSlot.isPending) return;
    const body = toCreateSlot(draft, today);
    if (!body) {
      // The date changed since a step was checked: go back to the field to fix.
      const invalid = firstInvalidStep(draft, today);
      if (invalid) {
        setStepIndex(WIZARD_STEPS.indexOf(invalid));
        setAttempted(true);
      }
      return;
    }
    createSlot.mutate(body, { onSuccess: () => router.replace("/(tabs)/slot") });
  };

  const weekdayLabel = (weekday: IsoWeekday) =>
    capitalize(weekdayName(weekday, names.weekdays), locale);
  const longDate = (date: CivilDate) => capitalize(formatLongDate(t, names, date), locale);
  const dateHint = (text: string) => {
    const date = parseDateInput(text);
    return date ? longDate(date) : undefined;
  };
  const deadlineDays = (days: number) =>
    days === 0
      ? t("new_slot.deadline_same_day")
      : days === 1
      ? t("new_slot.deadline_day_before")
      : t("new_slot.deadline_days_before", { count: days });

  const anchor = draft && today ? firstSession(draft, today) : null;
  const choices = draft && today ? firstSessionChoices(draft, today) : [];
  const createError = createSlot.isError ? slotErrorMessage(createSlot.error) : null;

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
          backLabel={stepIndex > 0 ? t("common.back") : undefined}
          onBack={goBack}
          title={t("slot.new")}
          subtitle={t("new_slot.subtitle")}
        />

        <View style={styles.body}>
          {/* ── Step indicator ── */}
          <View style={styles.stepsRow}>
            {WIZARD_STEPS.map((name, index) => (
              <View key={name} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    index === stepIndex ? styles.stepCircleActive : null,
                    index < stepIndex ? styles.stepCircleDone : null,
                  ]}
                >
                  {index < stepIndex ? <Check color={colors.red} size={14} /> : (
                    <Text
                      style={[styles.stepText, index === stepIndex ? styles.stepTextActive : null]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[styles.stepLabel, index === stepIndex ? styles.stepLabelActive : null]}
                >
                  {t(`new_slot.step_${name}`)}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Form card ── */}
          <View style={styles.formCard}>
            {!draft || !today
              ? (
                <View style={styles.centered}>
                  <ActivityIndicator color={colors.red} accessibilityLabel={t("common.loading")} />
                </View>
              )
              : (
                <>
                  {/* STEP 1 — Créneau */}
                  {step === "slot" && (
                    <>
                      <Text style={styles.stepHeading}>{t("new_slot.slot_heading")}</Text>

                      <Field label={t("new_slot.label_name")} error={errorText(errors.name)}>
                        <TextInput
                          {...nameFocus.focusProps}
                          value={draft.name}
                          onChangeText={(name) => update({ name })}
                          style={[styles.input, nameFocus.inputStyle, nameFocus.focusStyle]}
                          placeholder={t("new_slot.placeholder_name")}
                          placeholderTextColor={colors.placeholder}
                          maxLength={LIMITS.name * 2}
                          testID="input-slot-name"
                        />
                      </Field>

                      <Field label={t("new_slot.label_venue")} error={errorText(errors.venue)}>
                        <View style={[styles.inputWithIcon, venueFocus.focusStyle]}>
                          <MapPin color={colors.muted} size={16} />
                          <TextInput
                            {...venueFocus.focusProps}
                            value={draft.venue}
                            onChangeText={(venue) => update({ venue })}
                            style={[styles.inputFlexible, venueFocus.inputStyle]}
                            placeholder={t("new_slot.placeholder_venue")}
                            placeholderTextColor={colors.placeholder}
                            maxLength={LIMITS.venue * 2}
                            testID="input-venue"
                          />
                        </View>
                      </Field>

                      <Field label={t("new_slot.label_specialty")}>
                        <Choices
                          label={t("new_slot.label_specialty")}
                          options={SPECIALTIES}
                          value={draft.specialty}
                          onChange={(specialty) => update({ specialty })}
                          render={(value) => t(`slot.specialty.${value}`)}
                        />
                      </Field>

                      <Field label={t("new_slot.label_court")}>
                        <Choices
                          label={t("new_slot.label_court")}
                          options={COURTS}
                          value={draft.court}
                          onChange={(court) => update({ court })}
                          render={(value) => t(`slot.court.${value}`)}
                        />
                      </Field>
                    </>
                  )}

                  {/* STEP 2 — Fréquence */}
                  {step === "frequency" && (
                    <>
                      <Text style={styles.stepHeading}>{t("new_slot.frequency_heading")}</Text>

                      <Text style={styles.sectionLabel}>{t("new_slot.label_season")}</Text>
                      <Field
                        label={t("new_slot.label_start")}
                        hint={dateHint(draft.seasonStart)}
                        error={errorText(errors.seasonStart)}
                      >
                        <TextInput
                          {...startFocus.focusProps}
                          value={draft.seasonStart}
                          onChangeText={(seasonStart) => update({ seasonStart })}
                          style={[styles.input, startFocus.inputStyle, startFocus.focusStyle]}
                          placeholder={t("new_slot.placeholder_example", { value: "01/09/2026" })}
                          placeholderTextColor={colors.placeholder}
                          keyboardType="numbers-and-punctuation"
                          testID="input-season-start"
                        />
                      </Field>
                      <Field
                        label={t("new_slot.label_end")}
                        hint={dateHint(draft.seasonEnd)}
                        error={errorText(errors.seasonEnd)}
                      >
                        <TextInput
                          {...endFocus.focusProps}
                          value={draft.seasonEnd}
                          onChangeText={(seasonEnd) => update({ seasonEnd })}
                          style={[styles.input, endFocus.inputStyle, endFocus.focusStyle]}
                          placeholder={t("new_slot.placeholder_example", { value: "30/06/2027" })}
                          placeholderTextColor={colors.placeholder}
                          keyboardType="numbers-and-punctuation"
                          testID="input-season-end"
                        />
                      </Field>

                      <Field label={t("new_slot.label_weekday")}>
                        <Choices
                          label={t("new_slot.label_weekday")}
                          options={ISO_WEEKDAYS}
                          value={draft.weekday}
                          onChange={(weekday) => update({ weekday })}
                          render={(day) =>
                            capitalize(weekdayName(day, names.weekdaysShort), locale)}
                          describe={weekdayLabel}
                        />
                      </Field>

                      <Field label={t("new_slot.label_interval")}>
                        <Choices
                          label={t("new_slot.label_interval")}
                          options={INTERVALS}
                          value={draft.intervalWeeks}
                          onChange={(intervalWeeks) => update({ intervalWeeks })}
                          render={(weeks) =>
                            weeks === 2
                              ? t("slot.interval.fortnightly")
                              : t("slot.interval.weekly")}
                        />
                      </Field>

                      <Field
                        label={t("new_slot.label_first_session")}
                        error={errorText(errors.anchorDate)}
                      >
                        {choices.length > 1 && anchor
                          ? (
                            <Choices
                              label={t("new_slot.label_first_session")}
                              options={choices.map(toIsoDate)}
                              value={toIsoDate(anchor)}
                              onChange={(anchorDate) => update({ anchorDate })}
                              render={(iso) => {
                                const date = choices.find((d) => toIsoDate(d) === iso);
                                return date ? capitalize(formatDay(t, names, date), locale) : iso;
                              }}
                            />
                          )
                          : (
                            <Text style={styles.valueText}>
                              {anchor ? longDate(anchor) : "—"}
                            </Text>
                          )}
                      </Field>

                      <Field
                        label={t("new_slot.label_time")}
                        error={errorText(errors.timeFrom ?? errors.timeTo)}
                      >
                        <View style={styles.timeRow}>
                          <TextInput
                            {...timeFromFocus.focusProps}
                            value={draft.timeFrom}
                            onChangeText={(timeFrom) => update({ timeFrom })}
                            style={[
                              styles.input,
                              styles.inputHalf,
                              timeFromFocus.inputStyle,
                              timeFromFocus.focusStyle,
                            ]}
                            placeholder="18:00"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="numbers-and-punctuation"
                            testID="input-time-from"
                          />
                          <Text style={styles.timeSep}>→</Text>
                          <TextInput
                            {...timeToFocus.focusProps}
                            value={draft.timeTo}
                            onChangeText={(timeTo) => update({ timeTo })}
                            style={[
                              styles.input,
                              styles.inputHalf,
                              timeToFocus.inputStyle,
                              timeToFocus.focusStyle,
                            ]}
                            placeholder="20:00"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="numbers-and-punctuation"
                            testID="input-time-to"
                          />
                        </View>
                      </Field>

                      <View style={styles.previewBox}>
                        <CalendarClock color={colors.red} size={16} />
                        <Text style={styles.previewText}>{t("new_slot.fixed_hint")}</Text>
                      </View>
                    </>
                  )}

                  {/* STEP 3 — Joueurs */}
                  {step === "players" && (
                    <>
                      <Text style={styles.stepHeading}>{t("new_slot.players_heading")}</Text>

                      <Field
                        label={t("new_slot.label_min_players")}
                        hint={t("new_slot.min_players_hint")}
                        error={errorText(errors.minPlayers)}
                      >
                        <Stepper
                          label={t("new_slot.label_min_players")}
                          value={draft.minPlayers}
                          min={1}
                          max={LIMITS.players}
                          onChange={(value) => setDraft(withMinPlayers(draft, value))}
                        />
                      </Field>

                      <Field
                        label={t("new_slot.label_places")}
                        error={errorText(errors.places)}
                      >
                        <Stepper
                          label={t("new_slot.label_places")}
                          value={draft.places}
                          min={draft.minPlayers}
                          max={LIMITS.players}
                          onChange={(value) => setDraft(withPlaces(draft, value))}
                        />
                      </Field>

                      <Field
                        label={t("new_slot.label_deadline")}
                        hint={t("new_slot.deadline_at", {
                          day: deadlineDays(draft.deadlineDaysBefore),
                          time: parseTimeInput(draft.deadlineTime) ?? draft.deadlineTime,
                        })}
                        error={errorText(errors.deadlineDaysBefore ?? errors.deadlineTime)}
                      >
                        <Stepper
                          label={t("new_slot.label_deadline")}
                          value={draft.deadlineDaysBefore}
                          min={0}
                          max={LIMITS.deadlineDaysBefore}
                          onChange={(deadlineDaysBefore) => update({ deadlineDaysBefore })}
                          display={deadlineDays(draft.deadlineDaysBefore)}
                        />
                        <TextInput
                          {...deadlineFocus.focusProps}
                          value={draft.deadlineTime}
                          onChangeText={(deadlineTime) => update({ deadlineTime })}
                          style={[styles.input, deadlineFocus.inputStyle, deadlineFocus.focusStyle]}
                          placeholder="20:00"
                          placeholderTextColor={colors.placeholder}
                          accessibilityLabel={`${t("new_slot.label_deadline")}, ${
                            t("new_slot.label_time")
                          }`}
                          keyboardType="numbers-and-punctuation"
                          testID="input-deadline-time"
                        />
                      </Field>

                      <Field
                        label={t("new_slot.label_organizer")}
                        hint={t("new_slot.organizer_hint")}
                        error={errorText(errors.organizerName)}
                      >
                        <TextInput
                          {...organizerFocus.focusProps}
                          value={draft.organizerName}
                          onChangeText={(organizerName) => update({ organizerName })}
                          style={[
                            styles.input,
                            organizerFocus.inputStyle,
                            organizerFocus.focusStyle,
                          ]}
                          placeholder={t("new_slot.placeholder_organizer")}
                          placeholderTextColor={colors.placeholder}
                          autoComplete="given-name"
                          maxLength={LIMITS.organizerName * 2}
                          testID="input-organizer-name"
                        />
                      </Field>
                    </>
                  )}

                  {/* STEP 4 — Résumé */}
                  {step === "summary" && (
                    <Summary
                      draft={draft}
                      anchor={anchor}
                      longDate={longDate}
                      weekdayLabel={weekdayLabel}
                      deadlineDays={deadlineDays}
                    />
                  )}

                  {createError && isLastStep && (
                    <View style={styles.errorBox} accessibilityRole="alert">
                      <Text style={styles.errorTitle}>{t("new_slot.create_error")}</Text>
                      <Text style={styles.errorDetail}>
                        {t(createError.key, createError.params)}
                      </Text>
                    </View>
                  )}

                  {/* ── CTA ── */}
                  <PressableScale
                    onPress={isLastStep ? onCreate : onContinue}
                    testID="new-slot-continue"
                    accessibilityRole="button"
                    accessibilityLabel={isLastStep
                      ? t(createSlot.isPending ? "new_slot.cta_creating" : "new_slot.cta_create")
                      : t("new_slot.cta_continue")}
                    aria-busy={createSlot.isPending}
                  >
                    <View style={styles.ctaButton}>
                      <Text style={styles.ctaText}>
                        {isLastStep
                          ? t(
                            createSlot.isPending ? "new_slot.cta_creating" : "new_slot.cta_create",
                          )
                          : t("new_slot.cta_continue")}
                      </Text>
                      {createSlot.isPending
                        ? <ActivityIndicator color={colors.ink} size="small" />
                        : isLastStep
                        ? <Check color={colors.ink} size={18} />
                        : <ChevronRight color={colors.ink} size={18} />}
                    </View>
                  </PressableScale>
                </>
              )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary(
  { draft, anchor, longDate, weekdayLabel, deadlineDays }: {
    draft: SlotDraft;
    anchor: CivilDate | null;
    longDate: (date: CivilDate) => string;
    weekdayLabel: (weekday: IsoWeekday) => string;
    deadlineDays: (days: number) => string;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const start = parseDateInput(draft.seasonStart);
  const end = parseDateInput(draft.seasonEnd);
  const season = start && end
    ? (start.year === end.year ? `${start.year}` : `${start.year}–${end.year}`)
    : "—";
  const timeFrom = parseTimeInput(draft.timeFrom) ?? draft.timeFrom;
  const timeTo = parseTimeInput(draft.timeTo);
  const interval = draft.intervalWeeks === 2
    ? t("slot.interval.fortnightly")
    : t("slot.interval.weekly");

  return (
    <>
      <Text style={styles.stepHeading}>{t("new_slot.summary_heading")}</Text>

      <View style={styles.summarySection}>
        <Text style={styles.summaryLabel}>{t("new_slot.summary_slot")}</Text>
        <Text style={styles.summaryValue}>{draft.name.trim()}</Text>
        <Text style={styles.summaryMeta}>
          {`${t(`slot.specialty.${draft.specialty}`)} · ${t(`slot.court.${draft.court}`)}`}
        </Text>
        <View style={styles.summaryRow}>
          <MapPin color={colors.muted} size={13} />
          <Text style={styles.summaryMeta}>{draft.venue.trim()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.summarySection}>
        <Text style={styles.summaryLabel}>{t("new_slot.summary_season")}</Text>
        <Text style={styles.summaryValue}>{t("slot.season", { season })}</Text>
        <Text style={styles.summaryMeta}>
          {`${start ? longDate(start) : "?"} → ${end ? longDate(end) : "?"}`}
        </Text>
        <Text style={styles.summaryMeta}>
          {`${weekdayLabel(draft.weekday)} · ${
            timeTo ? `${timeFrom}–${timeTo}` : timeFrom
          } · ${interval}`}
        </Text>
        {anchor && (
          <Text style={styles.summaryMeta}>
            {t("new_slot.summary_first_session", { date: longDate(anchor) })}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.summarySection}>
        <Text style={styles.summaryLabel}>{t("new_slot.summary_players")}</Text>
        <View style={styles.summaryRow}>
          <Users color={colors.muted} size={13} />
          <Text style={styles.summaryValueSmall}>
            {t("new_slot.summary_players_value", { min: draft.minPlayers, places: draft.places })}
          </Text>
        </View>
        <Text style={styles.summaryMeta}>
          {t("new_slot.summary_deadline", {
            when: t("new_slot.deadline_at", {
              day: deadlineDays(draft.deadlineDaysBefore),
              time: parseTimeInput(draft.deadlineTime) ?? draft.deadlineTime,
            }),
          })}
        </Text>
        <Text style={styles.summaryMeta}>
          {t("new_slot.summary_organizer", { name: draft.organizerName.trim() })}
        </Text>
      </View>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120 },
    body: { paddingHorizontal: 20, paddingTop: 22, gap: 22 },
    centered: { paddingVertical: 32, alignItems: "center" },

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
    sectionLabel: { color: c.ink, fontSize: 16, fontWeight: "800" },

    field: { gap: 8 },
    label: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.3,
    },
    hint: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    fieldError: { color: c.red, fontSize: 13, fontWeight: "700", lineHeight: 18 },
    valueText: { color: c.ink, fontSize: 16, fontWeight: "700" },
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
    // minWidth 0: on web the <input> keeps its intrinsic width as a flex child, and the two
    // times overflowed the card on a phone.
    inputHalf: { flex: 1, minWidth: 0 },
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
      minWidth: 0,
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

    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    stepperButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperButtonOff: { backgroundColor: c.cream },
    stepperValue: {
      flex: 1,
      color: c.ink,
      fontSize: 17,
      fontWeight: "800",
      textAlign: "center",
      fontVariant: ["tabular-nums"],
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

    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      gap: 6,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    errorDetail: { color: c.muted, fontSize: 13, fontWeight: "600" },

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
    summaryValueSmall: { color: c.ink, fontSize: 15, fontWeight: "800" },
    summaryMeta: { color: c.muted, fontSize: 13, fontWeight: "600" },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 6 },

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
