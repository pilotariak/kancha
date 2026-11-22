import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterChips } from "@/components/FilterChips";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { Palette } from "@/constants/colors";
import {
  defaultTargetChoice,
  recentTeamsFor,
  TARGET_PRESETS,
  type TargetChoice,
  targetOf,
} from "@/features/score/setup";
import { useFieldFocus } from "@/hooks/use-interaction-styles";
import { useTextColumn } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { useScoreSetupStore } from "@/store/score-setup-store";

const OTHER = "other";

// ─── Setup screen ─────────────────────────────────────────────────────────────

interface SetupProps {
  onStart: (teamA: string, teamB: string, target: number) => void;
}

function SetupScreen({ onStart }: SetupProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const column = useTextColumn();
  const { bottom } = useSafeAreaInsets();
  const teamAFocus = useFieldFocus();
  const teamBFocus = useFieldFocus();
  const targetFocus = useFieldFocus();
  const recentTeams = useScoreSetupStore((s) => s.recentTeams);
  const lastTarget = useScoreSetupStore((s) => s.lastTarget);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  // Null until the user picks: the form follows the last target, which loads from storage
  // after the first render.
  const [picked, setPicked] = useState<TargetChoice | null>(null);

  const choice = picked ?? defaultTargetChoice(lastTarget);
  const target = targetOf(choice);
  const canStart = teamA.trim().length > 0 && teamB.trim().length > 0 && target !== null;

  function start() {
    if (canStart && target !== null) onStart(teamA.trim(), teamB.trim(), target);
  }

  const presetOptions = [
    ...TARGET_PRESETS.map((value) => ({ id: String(value), name: String(value) })),
    { id: OTHER, name: t("score.target_other") },
  ];
  const presetValue = choice?.kind === "preset" ? String(choice.value) : choice ? OTHER : undefined;

  function pickTarget(id: string) {
    if (id !== OTHER) setPicked({ kind: "preset", value: Number(id) });
    else if (choice?.kind !== "other") setPicked({ kind: "other", text: "" });
  }

  const teams = [
    {
      label: t("score.label_team_a"),
      value: teamA,
      setValue: setTeamA,
      other: teamB,
      focus: teamAFocus,
      dotStyle: styles.teamDotA,
      testID: "team-a",
    },
    {
      label: t("score.label_team_b"),
      value: teamB,
      setValue: setTeamB,
      other: teamA,
      focus: teamBFocus,
      dotStyle: styles.teamDotB,
      testID: "team-b",
    },
  ];

  return (
    // The keyboard covers the tab bar: the offset takes back the bar's inset, which the footer
    // already pads, so Start sits right on the keyboard.
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={-bottom}
    >
      {/* The top edge sits behind the light status bar: red like the header band. */}
      <SafeAreaView style={styles.top} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            column={column}
            title={t("score.setup_title")}
            subtitle={t("score.setup_subtitle")}
          />

          <View style={[styles.form, column]}>
            {teams.map((team) => {
              const recent = recentTeamsFor(recentTeams, team.other).map((name) => ({
                id: name,
                name,
              }));
              return (
                <View key={team.testID} style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <View style={[styles.teamDot, team.dotStyle]} />
                    <Text style={styles.fieldLabel}>{team.label}</Text>
                  </View>
                  <TextInput
                    {...team.focus.focusProps}
                    style={[styles.input, team.focus.inputStyle, team.focus.focusStyle]}
                    value={team.value}
                    onChangeText={team.setValue}
                    placeholder={t("score.placeholder_team")}
                    placeholderTextColor={colors.placeholder}
                    returnKeyType="next"
                    autoCapitalize="words"
                    accessibilityLabel={team.label}
                    testID={team.testID}
                  />
                  {recent.length > 0
                    ? (
                      <FilterChips
                        options={recent}
                        value={team.value.trim()}
                        onChange={team.setValue}
                        accessibilityLabel={t("score.recent_teams", { team: team.label })}
                        wrap={column !== undefined}
                        testID={`${team.testID}-recent`}
                      />
                    )
                    : null}
                </View>
              );
            })}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("score.label_target")}</Text>
              <FilterChips
                options={presetOptions}
                value={presetValue}
                onChange={pickTarget}
                accessibilityLabel={t("score.label_target")}
                wrap
                testID="target"
              />
              {choice?.kind === "other"
                ? (
                  <TextInput
                    {...targetFocus.focusProps}
                    style={[styles.input, targetFocus.inputStyle, targetFocus.focusStyle]}
                    value={choice.text}
                    onChangeText={(text) => setPicked({ kind: "other", text })}
                    placeholder={t("score.placeholder_target")}
                    placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    // Opened by a press on "other", not when the last target opens it.
                    autoFocus={picked !== null}
                    accessibilityLabel={t("score.label_target")}
                    testID="target-input"
                  />
                )
                : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Out of the scroll view, Start stays above the keyboard and the tab bar. */}
      <View style={[styles.footer, { paddingBottom: bottom }]}>
        <View style={[styles.footerContent, column]}>
          <Pressable
            style={(
              { pressed },
            ) => [
              styles.startBtn,
              !canStart && styles.startBtnDisabled,
              pressed && canStart && styles.startBtnPressed,
            ]}
            onPress={start}
            disabled={!canStart}
            accessibilityRole="button"
            accessibilityLabel={target === null
              ? t("score.cta_start")
              : t("score.cta_start_target_a11y", { count: target })}
            testID="start"
          >
            <Text style={styles.startBtnLabel} numberOfLines={1}>
              {target === null ? t("score.cta_start") : t("score.cta_start_target", { target })}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

// The match itself is the full-screen /match route, over the tabs. The form stays mounted under
// it, so its keyboard would stay up.
const startMatch = (teamA: string, teamB: string, target: number) => {
  Keyboard.dismiss();
  useScoreSetupStore.getState().remember(teamA, teamB, target);
  router.push({ pathname: "/match", params: { teamA, teamB, target: String(target) } });
};

// The root provider sits outside the native tab bar, so its bottom inset is the home indicator
// alone. This one is inside the tab: its bottom inset covers the tab bar too.
export default function ScoreScreen() {
  return (
    <SafeAreaProvider>
      <SetupScreen onStart={startMatch} />
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.cream },
    top: { flex: 1, backgroundColor: c.redFill },
    scroll: { flex: 1, backgroundColor: c.cream },
    scrollContent: { paddingBottom: 24 },
    form: { paddingHorizontal: 20, paddingTop: 28, gap: 18 },
    fieldGroup: { gap: 8 },
    fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    fieldLabel: {
      color: c.ink,
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    teamDot: { width: 10, height: 10, borderRadius: 5 },
    teamDotA: { backgroundColor: c.red },
    teamDotB: { backgroundColor: c.ink },
    input: {
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 16,
      fontWeight: "700",
      color: c.ink,
    },
    footer: {
      backgroundColor: c.cream,
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    footerContent: { paddingHorizontal: 20, paddingVertical: 12 },
    startBtn: {
      borderRadius: 16,
      backgroundColor: c.redFill,
      paddingVertical: 18,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    startBtnDisabled: { opacity: 0.35 },
    startBtnPressed: { opacity: 0.75 },
    startBtnLabel: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
  });
