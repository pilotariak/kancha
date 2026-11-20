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
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import type { Palette } from "@/constants/colors";
import { useFieldFocus } from "@/hooks/use-interaction-styles";
import { useTextColumn } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

// ─── Setup screen ─────────────────────────────────────────────────────────────

interface SetupProps {
  onStart: (teamA: string, teamB: string, target: number) => void;
}

function SetupScreen({ onStart }: SetupProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const column = useTextColumn();
  const teamAFocus = useFieldFocus();
  const teamBFocus = useFieldFocus();
  const targetFocus = useFieldFocus();
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [targetRaw, setTargetRaw] = useState("");

  const target = parseInt(targetRaw, 10);
  const canStart = teamA.trim().length > 0 && teamB.trim().length > 0 && target > 0;

  return (
    <KeyboardAvoidingView
      style={styles.setupFlex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.setupContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          column={column}
          title={t("score.setup_title")}
          subtitle={t("score.setup_subtitle")}
        />

        <View style={[styles.setupBody, column]}>
          <View style={styles.setupForm}>
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <View style={[styles.teamDot, styles.teamDotA]} />
                <Text style={styles.fieldLabel}>{t("score.label_team_a")}</Text>
              </View>
              <TextInput
                {...teamAFocus.focusProps}
                style={[styles.input, teamAFocus.inputStyle, teamAFocus.focusStyle]}
                value={teamA}
                onChangeText={setTeamA}
                placeholder={t("score.placeholder_team")}
                placeholderTextColor={colors.placeholder}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <View style={[styles.teamDot, styles.teamDotB]} />
                <Text style={styles.fieldLabel}>{t("score.label_team_b")}</Text>
              </View>
              <TextInput
                {...teamBFocus.focusProps}
                style={[styles.input, teamBFocus.inputStyle, teamBFocus.focusStyle]}
                value={teamB}
                onChangeText={setTeamB}
                placeholder={t("score.placeholder_team")}
                placeholderTextColor={colors.placeholder}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("score.label_target")}</Text>
              <TextInput
                {...targetFocus.focusProps}
                style={[styles.input, targetFocus.inputStyle, targetFocus.focusStyle]}
                value={targetRaw}
                onChangeText={setTargetRaw}
                placeholder={t("score.placeholder_target")}
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          <Pressable
            style={(
              { pressed },
            ) => [
              styles.startBtn,
              !canStart && styles.startBtnDisabled,
              pressed && canStart && styles.startBtnPressed,
            ]}
            onPress={() => canStart && onStart(teamA.trim(), teamB.trim(), target)}
            disabled={!canStart}
            accessibilityRole="button"
            accessibilityLabel={t("score.cta_start")}
          >
            <Text style={styles.startBtnLabel}>{t("score.cta_start")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

// The match itself is the full-screen /match route, over the tabs. The form stays mounted under
// it, so its keyboard would stay up.
const startMatch = (teamA: string, teamB: string, target: number) => {
  Keyboard.dismiss();
  router.push({ pathname: "/match", params: { teamA, teamB, target: String(target) } });
};

export default function ScoreScreen() {
  const styles = useThemedStyles(makeStyles);

  // The top edge sits behind the light status bar: red like the header band.
  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <SetupScreen onStart={startMatch} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.redFill },

    // Setup
    setupFlex: { flex: 1, backgroundColor: c.cream },
    setupContent: { paddingBottom: 24 },
    setupBody: { paddingHorizontal: 20, paddingTop: 28, gap: 28 },
    setupForm: { gap: 18 },
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
    startBtn: {
      borderRadius: 16,
      backgroundColor: c.redFill,
      paddingVertical: 18,
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
