import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Redirect, router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useId, useReducer, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Share, Share2, Trophy, Undo2, X } from "@/components/icons";
import { useShareCard } from "@/components/ShareCard";
import type { Palette } from "@/constants/colors";
import { scoreDigits } from "@/constants/typography";
import { INITIAL, reducer, type ScoreState, type Side } from "@/features/score/scoreMachine";
import { scoreCardData } from "@/features/share/share-card";
import { type InteractionState, showsFocusRing } from "@/hooks/use-interaction-styles";
import { useTextColumn } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const isWeb = Platform.OS === "web";

const subscribeNever = () => () => {};

const CLOSE_SIZE = 48;

const ShareIcon = Platform.OS === "android" ? Share2 : Share;

interface MatchSettings {
  teamA: string;
  teamB: string;
  target: number;
}

type MatchParams = { teamA?: string; teamB?: string; target?: string };

function parseSettings({ teamA = "", teamB = "", target = "" }: MatchParams): MatchSettings | null {
  const settings = { teamA: teamA.trim(), teamB: teamB.trim(), target: parseInt(target, 10) };
  return settings.teamA && settings.teamB && settings.target > 0 ? settings : null;
}

// expo-haptics: iOS and Android only.
function haptic(feedback: () => Promise<void>) {
  if (!isWeb) feedback().catch(() => undefined);
}

/**
 * Keeps the screen on while `active`. expo-keep-awake's `useKeepAwake` leaves a refused web Wake
 * Lock request unhandled (no Wake Lock API, or the browser says no), and an unmount before the
 * lock is granted releases nothing, so the lock then stays. Here the release waits for the
 * request to settle.
 */
function useKeepAwakeWhile(active: boolean) {
  const tag = useId();

  useEffect(() => {
    if (!active) return;
    const taken = activateKeepAwakeAsync(tag).then(() => true, () => false);
    return () => {
      void taken.then((held) => {
        if (held) return deactivateKeepAwake(tag);
      });
    };
  }, [active, tag]);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ score, target }: { score: number; target: number }) {
  const styles = useThemedStyles(makeStyles);
  const ratio = Math.min(score / target, 1);
  const progress = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: ratio, duration: 250, useNativeDriver: false }).start();
  }, [progress, ratio]);

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
        ]}
      />
    </View>
  );
}

// ─── Team half ────────────────────────────────────────────────────────────────

interface HalfProps {
  team: string;
  score: number;
  target: number;
  placement: "top" | "bottom";
  /** The safe area inset on the screen edge this half touches. */
  edgeInset: number;
  onAdd: () => void;
  onUndo: () => void;
}

/**
 * One team's half of the screen. The whole half is the +1 button: it fills the half behind the
 * content, which lets touches through. Undo is its sibling, not its child, so screen readers
 * reach both.
 */
function TeamHalf({ team, score, target, placement, edgeInset, onAdd, onUndo }: HalfProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const column = useTextColumn();
  const isTop = placement === "top";
  const canUndo = score > 0;

  const teamRow = (
    <View style={styles.teamRow}>
      <View style={styles.teamNameWrap} aria-hidden>
        <Text style={styles.teamName} numberOfLines={1}>{team}</Text>
      </View>
      <Pressable
        style={(interaction: InteractionState) => [
          styles.undoBtn,
          interaction.pressed && styles.undoBtnPressed,
          !canUndo && styles.undoBtnDisabled,
          showsFocusRing(interaction) && styles.focusRing,
        ]}
        onPress={onUndo}
        disabled={!canUndo}
        aria-disabled={!canUndo}
        accessibilityRole="button"
        accessibilityLabel={t("score.undo_point", { team })}
      >
        <Undo2 color="#FFFFFF" size={22} />
      </Pressable>
    </View>
  );

  const scoreRow = (
    <View style={styles.scoreRow} aria-hidden>
      <Text style={styles.scoreNumber}>{score}</Text>
      <Text style={styles.scoreTarget}>/ {target}</Text>
      <View style={styles.addHint}>
        <Text style={styles.addHintLabel}>+1</Text>
      </View>
    </View>
  );

  const bar = (
    <View style={styles.barWrap} aria-hidden>
      <ProgressBar score={score} target={target} />
    </View>
  );

  return (
    <View style={[styles.half, { backgroundColor: isTop ? colors.redFill : colors.panel }]}>
      <Pressable
        style={(interaction: InteractionState) => [
          StyleSheet.absoluteFill,
          interaction.pressed && styles.halfPressed,
          showsFocusRing(interaction) && styles.halfFocusRing,
        ]}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={t("score.add_point", { team, score, target })}
      />
      <View
        style={[
          styles.halfContent,
          isTop
            ? { paddingTop: 20 + edgeInset, paddingBottom: CLOSE_SIZE / 2 + 12 }
            : { paddingTop: CLOSE_SIZE / 2 + 12, paddingBottom: 20 + edgeInset },
          column,
        ]}
      >
        {isTop
          ? (
            <>
              {teamRow}
              {scoreRow}
              {bar}
            </>
          )
          : (
            <>
              {bar}
              {scoreRow}
              {teamRow}
            </>
          )}
      </View>
    </View>
  );
}

// ─── Win screen ───────────────────────────────────────────────────────────────

interface WinProps {
  state: ScoreState;
  onUndo: () => void;
  onNewGame: () => void;
}

function WinScreen({ state, onUndo, onNewGame }: WinProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const column = useTextColumn();
  const insets = useSafeAreaInsets();
  const sharing = useShareCard();
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const winnerName = state.winner === "a" ? state.teamA : state.teamB;

  return (
    <View
      style={[styles.winFlex, { paddingTop: 20 + insets.top, paddingBottom: 28 + insets.bottom }]}
    >
      <Animated.View style={[styles.winContent, column, { opacity }]}>
        <Animated.View style={[styles.winTrophyWrap, { transform: [{ scale }] }]}>
          <Trophy color={colors.amber} size={64} />
        </Animated.View>

        <Text style={styles.winLabel}>{t("score.winner")}</Text>
        <Text style={styles.winTeam} accessibilityRole="header">{winnerName}</Text>

        <View style={styles.winScoreCard}>
          <View style={styles.winScoreRow}>
            <Text style={styles.winScoreTeam} numberOfLines={1}>{state.teamA}</Text>
            <Text style={styles.winScoreNum}>{state.scoreA}</Text>
          </View>
          <View style={styles.winScoreDivider} />
          <View style={styles.winScoreRow}>
            <Text style={styles.winScoreTeam} numberOfLines={1}>{state.teamB}</Text>
            <Text style={styles.winScoreNum}>{state.scoreB}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.winActions, column]}>
        <Pressable
          style={(interaction: InteractionState) => [
            styles.winUndoBtn,
            interaction.pressed && styles.winUndoBtnPressed,
            showsFocusRing(interaction) && styles.focusRing,
          ]}
          onPress={() => sharing.share(scoreCardData(state, t, i18n.resolvedLanguage ?? "en"))}
          accessibilityRole="button"
          accessibilityLabel={t("share.score_a11y")}
          testID="share-score"
        >
          <ShareIcon color="#FFFFFF" size={18} />
          <Text style={styles.winUndoLabel}>{t("share.cta")}</Text>
        </Pressable>
        <Pressable
          style={(interaction: InteractionState) => [
            styles.winUndoBtn,
            interaction.pressed && styles.winUndoBtnPressed,
            showsFocusRing(interaction) && styles.focusRing,
          ]}
          onPress={onUndo}
          accessibilityRole="button"
          accessibilityLabel={t("score.undo_point", { team: winnerName })}
        >
          <Undo2 color="#FFFFFF" size={18} />
          <Text style={styles.winUndoLabel}>{t("score.undo_last")}</Text>
        </Pressable>
        <Pressable
          style={(interaction: InteractionState) => [
            styles.newGameBtn,
            interaction.pressed && styles.newGameBtnPressed,
            showsFocusRing(interaction) && styles.focusRing,
          ]}
          onPress={onNewGame}
          accessibilityRole="button"
          accessibilityLabel={t("score.cta_new_game")}
        >
          <Text style={styles.newGameLabel}>{t("score.cta_new_game")}</Text>
        </Pressable>
      </View>
      {/* The card being shared, off screen. */}
      {sharing.card}
    </View>
  );
}

// ─── Match ────────────────────────────────────────────────────────────────────

function Match({ settings }: { settings: MatchSettings }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(
    reducer,
    settings,
    (s) => reducer(INITIAL, { type: "start", ...s }),
  );

  useKeepAwakeWhile(state.phase === "playing");

  useEffect(() => {
    if (state.phase === "won") {
      haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    }
  }, [state.phase]);

  // The close button and Android's back button remove this route: ask before a game in progress
  // is lost. The browser's back button skips beforeRemove and leaves without asking.
  const inProgress = state.phase === "playing" && (state.scoreA > 0 || state.scoreB > 0);
  useEffect(() => {
    if (!inProgress) return;
    return navigation.addListener("beforeRemove", (event) => {
      const title = t("score.confirm_close_title");
      const message = t("score.confirm_close_message");
      if (isWeb) {
        // Alert.alert does nothing on web.
        if (!window.confirm(`${title}\n\n${message}`)) event.preventDefault();
        return;
      }
      event.preventDefault();
      Alert.alert(title, message, [
        { text: t("score.confirm_close_cancel"), style: "cancel" },
        {
          text: t("score.confirm_close_cta"),
          style: "destructive",
          onPress: () => navigation.dispatch(event.data.action),
        },
      ]);
    });
  }, [inProgress, navigation, t]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/score");
  };

  const add = (side: Side) => {
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    dispatch({ type: "increment", side });
  };

  const undo = (side: Side) => {
    haptic(Haptics.selectionAsync);
    dispatch({ type: "undo", side });
  };

  if (state.phase === "won" && state.winner) {
    const winner = state.winner;
    return <WinScreen state={state} onUndo={() => undo(winner)} onNewGame={close} />;
  }

  return (
    <View style={styles.root}>
      <TeamHalf
        placement="top"
        team={state.teamA}
        score={state.scoreA}
        target={state.target}
        edgeInset={insets.top}
        onAdd={() => add("a")}
        onUndo={() => undo("a")}
      />
      <TeamHalf
        placement="bottom"
        team={state.teamB}
        score={state.scoreB}
        target={state.target}
        edgeInset={insets.bottom}
        onAdd={() => add("b")}
        onUndo={() => undo("b")}
      />
      <Pressable
        style={(interaction: InteractionState) => [
          styles.closeBtn,
          interaction.pressed && styles.closeBtnPressed,
          showsFocusRing(interaction) && styles.focusRing,
        ]}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={t("score.close_match")}
      >
        <X color={colors.panel} size={22} />
      </Pressable>
    </View>
  );
}

/**
 * The match, full screen over the tabs. Setup (the Score tab) passes the teams and the target as
 * params; without them, as on a reload of /match from the static export, it goes back to setup.
 */
export default function MatchScreen() {
  const params = useLocalSearchParams<MatchParams>();
  // The static HTML of /match knows no query string: render nothing until hydrated, so a reload
  // of /match?teamA=… hydrates the same empty tree before it reads the params.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!hydrated) return null;
  const settings = parseSettings(params);
  return settings ? <Match settings={settings} /> : <Redirect href="/(tabs)/score" />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.panel },

    // Halves
    half: { flex: 1 },
    halfPressed: { backgroundColor: "rgba(255,255,255,0.08)" },
    // The red ring of the other screens disappears on red: white, inside the half.
    halfFocusRing: {
      outlineColor: "#FFFFFF",
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: -6,
    },
    focusRing: {
      outlineColor: "#FFFFFF",
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 2,
    },
    halfContent: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "space-between",
      // Touches go through to the +1 button behind, except on the undo button.
      pointerEvents: "box-none",
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      pointerEvents: "box-none",
    },
    teamNameWrap: { flex: 1, pointerEvents: "none" },
    teamName: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    undoBtn: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.16)",
      alignItems: "center",
      justifyContent: "center",
    },
    undoBtnPressed: { backgroundColor: "rgba(255,255,255,0.3)" },
    undoBtnDisabled: { opacity: 0.35 },
    scoreRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      pointerEvents: "none",
    },
    scoreNumber: {
      ...scoreDigits.black,
      color: "#FFFFFF",
      fontSize: 112,
      lineHeight: 112,
    },
    scoreTarget: {
      ...scoreDigits.bold,
      color: c.onRedSoft,
      fontSize: 28,
      // Puts its baseline on the score's, in the 112px line.
      marginBottom: 6,
    },
    addHint: {
      marginLeft: "auto",
      marginBottom: 14,
      borderRadius: 9999,
      backgroundColor: "rgba(255,255,255,0.16)",
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    addHintLabel: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
    barWrap: { pointerEvents: "none" },
    barTrack: {
      height: 6,
      borderRadius: 9999,
      backgroundColor: "rgba(255,255,255,0.18)",
      overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 9999, backgroundColor: "#FFFFFF" },

    // Close: on the seam between the halves, white on both team colors.
    closeBtn: {
      position: "absolute",
      top: "50%",
      alignSelf: "center",
      marginTop: -CLOSE_SIZE / 2,
      width: CLOSE_SIZE,
      height: CLOSE_SIZE,
      borderRadius: CLOSE_SIZE / 2,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    },
    closeBtnPressed: { transform: [{ scale: 0.94 }] },

    // Win screen
    winFlex: {
      flex: 1,
      backgroundColor: c.green,
      paddingHorizontal: 28,
      justifyContent: "space-between",
    },
    winContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    winTrophyWrap: {
      width: 112,
      height: 112,
      borderRadius: 36,
      backgroundColor: c.amberBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    winLabel: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    winTeam: {
      color: "#FFFFFF",
      fontSize: 36,
      fontWeight: "900",
      textAlign: "center",
      lineHeight: 40,
    },
    winScoreCard: {
      marginTop: 20,
      width: "100%",
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.15)",
      overflow: "hidden",
    },
    winScoreRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 22,
      paddingVertical: 16,
      gap: 12,
    },
    winScoreTeam: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },
    winScoreNum: {
      color: "#FFFFFF",
      fontSize: 32,
      fontWeight: "900",
      minWidth: 40,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    winScoreDivider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      marginHorizontal: 22,
    },
    winActions: { gap: 12 },
    winUndoBtn: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.4)",
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    winUndoBtnPressed: { backgroundColor: "rgba(255,255,255,0.12)" },
    winUndoLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    newGameBtn: {
      borderRadius: 18,
      backgroundColor: c.redFill,
      paddingVertical: 20,
      alignItems: "center",
    },
    newGameBtnPressed: { opacity: 0.8 },
    newGameLabel: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
  });
