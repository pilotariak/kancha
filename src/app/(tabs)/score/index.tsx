import { Undo2 } from "lucide-react-native";
import React, { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

import { KanchaColors } from "@/constants/colors";

// ─── State machine ────────────────────────────────────────────────────────────

type Phase = "setup" | "playing" | "won";

interface ScoreState {
  phase: Phase;
  teamA: string;
  teamB: string;
  target: number;
  scoreA: number;
  scoreB: number;
  prev: { scoreA: number; scoreB: number } | null;
  winner: "a" | "b" | null;
}

type ScoreAction =
  | { type: "start"; teamA: string; teamB: string; target: number }
  | { type: "increment"; side: "a" | "b" }
  | { type: "undo" }
  | { type: "reset" };

const INITIAL: ScoreState = {
  phase: "setup",
  teamA: "",
  teamB: "",
  target: 0,
  scoreA: 0,
  scoreB: 0,
  prev: null,
  winner: null,
};

function reducer(state: ScoreState, action: ScoreAction): ScoreState {
  switch (action.type) {
    case "start":
      return {
        ...INITIAL,
        phase: "playing",
        teamA: action.teamA,
        teamB: action.teamB,
        target: action.target,
      };
    case "increment": {
      const nextA = action.side === "a" ? state.scoreA + 1 : state.scoreA;
      const nextB = action.side === "b" ? state.scoreB + 1 : state.scoreB;
      const won = nextA >= state.target || nextB >= state.target;
      return {
        ...state,
        prev: { scoreA: state.scoreA, scoreB: state.scoreB },
        scoreA: nextA,
        scoreB: nextB,
        phase: won ? "won" : "playing",
        winner: won ? (nextA >= state.target ? "a" : "b") : null,
      };
    }
    case "undo":
      if (!state.prev) return state;
      return { ...state, ...state.prev, prev: null, phase: "playing", winner: null };
    case "reset":
      return INITIAL;
  }
}

// ─── Setup screen ─────────────────────────────────────────────────────────────

interface SetupProps {
  onStart: (teamA: string, teamB: string, target: number) => void;
}

function SetupScreen({ onStart }: SetupProps) {
  const { t } = useTranslation();
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
        <View style={styles.setupHeader}>
          <Text style={styles.setupTitle}>{t("score.setup_title")}</Text>
          <Text style={styles.setupSubtitle}>{t("score.setup_subtitle")}</Text>
        </View>

        <View style={styles.setupForm}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("score.label_team_a")}</Text>
            <TextInput
              style={[styles.input, styles.inputRed]}
              value={teamA}
              onChangeText={setTeamA}
              placeholder={t("score.placeholder_team")}
              placeholderTextColor="rgba(200,16,46,0.35)"
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("score.label_team_b")}</Text>
            <TextInput
              style={[styles.input, styles.inputDark]}
              value={teamB}
              onChangeText={setTeamB}
              placeholder={t("score.placeholder_team")}
              placeholderTextColor="rgba(255,255,255,0.3)"
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("score.label_target")}</Text>
            <TextInput
              style={[styles.input, styles.inputNeutral]}
              value={targetRaw}
              onChangeText={setTargetRaw}
              placeholder={t("score.placeholder_target")}
              placeholderTextColor={KanchaColors.muted}
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
        >
          <Text style={styles.startBtnLabel}>{t("score.cta_start")}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Score panel ──────────────────────────────────────────────────────────────

interface PanelProps {
  team: string;
  score: number;
  target: number;
  canUndo: boolean;
  isWinner: boolean | null;
  side: "top" | "bottom";
  onIncrement: () => void;
  onUndo: () => void;
}

function ScorePanel(
  { team, score, target, canUndo, isWinner, side, onIncrement, onUndo }: PanelProps,
) {
  const { t } = useTranslation();
  const isTop = side === "top";
  const bg = isTop ? KanchaColors.red : KanchaColors.panel;
  const winnerBg = KanchaColors.green;
  const activeBg = isWinner ? winnerBg : bg;

  const controls = (
    <View style={styles.panelControls}>
      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        onPress={onIncrement}
        disabled={isWinner !== null && !isWinner}
      >
        <Text style={styles.addBtnLabel}>+1</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.undoBtn,
          !canUndo && styles.undoBtnDisabled,
          pressed && canUndo && styles.undoBtnPressed,
        ]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Undo2 color={KanchaColors.white} size={18} />
        <Text style={styles.undoBtnLabel}>{t("score.undo")}</Text>
      </Pressable>
    </View>
  );

  const scoreDisplay = (
    <View style={styles.scoreDisplayWrap}>
      <Text style={styles.scoreNumber}>{score}</Text>
      <Text style={styles.scoreTarget}>/ {target}</Text>
    </View>
  );

  const teamLabel = (
    <View style={styles.teamLabelRow}>
      {isWinner && <Text style={styles.winnerBadge}>{t("score.winner")}</Text>}
      <Text style={styles.teamName}>{team}</Text>
    </View>
  );

  return (
    <View style={[styles.panel, { backgroundColor: activeBg }]}>
      {isTop
        ? (
          <>
            {teamLabel}
            {scoreDisplay}
            {controls}
          </>
        )
        : (
          <>
            {controls}
            {scoreDisplay}
            {teamLabel}
          </>
        )}
    </View>
  );
}

// ─── Game screen ──────────────────────────────────────────────────────────────

interface GameProps {
  state: ScoreState;
  dispatch: React.Dispatch<ScoreAction>;
}

function GameScreen({ state, dispatch }: GameProps) {
  const { t } = useTranslation();
  const gameOver = state.phase === "won";

  return (
    <View style={styles.gameFlex}>
      <ScorePanel
        side="top"
        team={state.teamA}
        score={state.scoreA}
        target={state.target}
        canUndo={state.prev !== null}
        isWinner={gameOver ? state.winner === "a" : null}
        onIncrement={() => dispatch({ type: "increment", side: "a" })}
        onUndo={() => dispatch({ type: "undo" })}
      />

      <View style={styles.divider}>
        <Pressable
          style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
          onPress={() => dispatch({ type: "reset" })}
        >
          <Text style={styles.resetLabel}>
            {gameOver ? t("score.cta_new_game") : t("score.reset")}
          </Text>
        </Pressable>
      </View>

      <ScorePanel
        side="bottom"
        team={state.teamB}
        score={state.scoreB}
        target={state.target}
        canUndo={state.prev !== null}
        isWinner={gameOver ? state.winner === "b" : null}
        onIncrement={() => dispatch({ type: "increment", side: "b" })}
        onUndo={() => dispatch({ type: "undo" })}
      />
    </View>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function ScoreScreen() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {state.phase === "setup"
        ? (
          <SetupScreen
            onStart={(teamA, teamB, target) => dispatch({ type: "start", teamA, teamB, target })}
          />
        )
        : <GameScreen state={state} dispatch={dispatch} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KanchaColors.ink },

  // Setup
  setupFlex: { flex: 1, backgroundColor: KanchaColors.cream },
  setupContent: {
    flexGrow: 1,
    padding: 24,
    gap: 28,
    justifyContent: "center",
  },
  setupHeader: { gap: 6 },
  setupTitle: {
    color: KanchaColors.ink,
    fontSize: 32,
    fontWeight: "900",
  },
  setupSubtitle: {
    color: KanchaColors.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  setupForm: { gap: 18 },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    color: KanchaColors.ink,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "700",
    color: KanchaColors.white,
  },
  inputRed: { backgroundColor: KanchaColors.red },
  inputDark: { backgroundColor: KanchaColors.panel },
  inputNeutral: {
    backgroundColor: KanchaColors.ink,
    color: KanchaColors.white,
  },
  startBtn: {
    borderRadius: 16,
    backgroundColor: KanchaColors.red,
    paddingVertical: 18,
    alignItems: "center",
  },
  startBtnDisabled: { opacity: 0.35 },
  startBtnPressed: { opacity: 0.75 },
  startBtnLabel: {
    color: KanchaColors.white,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  // Game
  gameFlex: { flex: 1 },
  panel: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  teamLabelRow: { gap: 4 },
  teamName: {
    color: KanchaColors.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  winnerBadge: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  scoreDisplayWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  scoreNumber: {
    color: KanchaColors.white,
    fontSize: 96,
    fontWeight: "900",
    lineHeight: 100,
  },
  scoreTarget: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  panelControls: {
    flexDirection: "row",
    gap: 12,
  },
  addBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 18,
    alignItems: "center",
  },
  addBtnPressed: { backgroundColor: "rgba(255,255,255,0.32)" },
  addBtnLabel: {
    color: KanchaColors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  undoBtn: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  undoBtnDisabled: { opacity: 0.25 },
  undoBtnPressed: { backgroundColor: "rgba(255,255,255,0.2)" },
  undoBtnLabel: {
    color: KanchaColors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Divider
  divider: {
    height: 52,
    backgroundColor: KanchaColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  resetBtnPressed: { backgroundColor: "rgba(255,255,255,0.16)" },
  resetLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
