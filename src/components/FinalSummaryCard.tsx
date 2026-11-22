import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronRight, Trophy } from "@/components/icons";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import {
  factsText,
  finalDateText,
  finalLabel,
  type FinalSummary,
  scoreText,
  type SummaryPlayer,
  type SummaryTeam,
  thirdPlaceLabel,
} from "@/features/competitions/finalSummary";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/** A winner with a licence: a pill that opens the player, as in the ranking. */
function WinnerLink({ player }: { player: SummaryPlayer & { licence: string } }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(tabs)/competitions/player",
          params: { licence: player.licence },
        })}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={player.name}
      accessibilityHint={t("player.open_hint")}
      style={(state: InteractionState) => [
        styles.playerLink,
        (state.pressed || state.hovered) && styles.playerLinkPressed,
        showsFocusRing(state) && interaction.focusRing,
      ]}
      testID={`final-summary-player-${player.licence}`}
    >
      <Text style={styles.playerLinkLabel}>{player.name}</Text>
      <ChevronRight color={colors.muted} size={14} />
    </Pressable>
  );
}

/** A team on two lines: its players, then its club. A team without lineup is its club alone. */
function TeamLines({ team, prefix }: { team: SummaryTeam; prefix?: (name: string) => string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.teamLines}>
      <Text style={styles.teamName}>{prefix ? prefix(team.name) : team.name}</Text>
      {team.players.length > 0 ? <Text style={styles.club}>{team.club}</Text> : null}
    </View>
  );
}

/**
 * What a finished competition comes down to, in place of the progress row: the winners, the
 * final, third place and a few facts. Each part reads as one sentence to screen readers; the
 * winners' links stay their own buttons.
 */
export function FinalSummaryCard({ summary }: { summary: FinalSummary }) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const locale = i18n.resolvedLanguage ?? "en";
  const { winners } = summary;
  const date = finalDateText(summary, locale);

  return (
    <View style={styles.card} testID="final-summary">
      <View style={styles.head}>
        <View style={styles.trophy} aria-hidden>
          <Trophy color={colors.amber} size={18} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{t("final_summary.title")}</Text>
        <StatusPill label={t("details.finished")} tone="dark" />
      </View>

      <View style={styles.section}>
        {winners.players.length > 0
          ? (
            <View style={styles.players}>
              {winners.players.map((player) =>
                player.licence
                  ? (
                    <WinnerLink
                      key={player.licence}
                      player={{ name: player.name, licence: player.licence }}
                    />
                  )
                  : <Text key={player.name} style={styles.winnerName}>{player.name}</Text>
              )}
            </View>
          )
          : null}
        <Text
          style={winners.players.length > 0 ? styles.club : styles.winnerName}
          testID="final-summary-club"
        >
          {winners.club}
        </Text>
      </View>

      <View
        style={[styles.section, styles.sectionLine]}
        accessible
        accessibilityLabel={finalLabel(summary, t, locale)}
        role="group"
        testID="final-summary-final"
      >
        <View style={styles.sectionInner} aria-hidden>
          <Text style={styles.sectionLabel}>
            {t("rounds.F")}
            {date ? <Text style={styles.sectionDate}>{` · ${date}`}</Text> : null}
          </Text>
          <View style={styles.finalRow}>
            {/* The digits sit in their own Text: they take the condensed font (#115). */}
            <Text style={styles.finalScore}>{scoreText(summary.sets)}</Text>
            <TeamLines
              team={summary.runnerUp}
              prefix={(team) => t("final_summary.against", { team })}
            />
          </View>
        </View>
      </View>

      {summary.thirdPlace.length > 0
        ? (
          <View
            style={[styles.section, styles.sectionLine]}
            accessible
            accessibilityLabel={thirdPlaceLabel(summary, t)}
            role="group"
            testID="final-summary-third"
          >
            <View style={styles.sectionInner} aria-hidden>
              <Text style={styles.sectionLabel}>{t("final_summary.third_place")}</Text>
              {summary.thirdPlace.map((team, i) => <TeamLines key={i} team={team} />)}
            </View>
          </View>
        )
        : null}

      <Text style={[styles.facts, styles.sectionLine]} testID="final-summary-facts">
        {factsText(summary, t, locale)}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    head: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    trophy: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.amberBg,
    },
    title: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "800", lineHeight: 20 },

    // Parts of the card, split by hairlines.
    section: { gap: 6, paddingBottom: 12 },
    sectionLine: { borderTopWidth: 1, borderTopColor: c.line, paddingTop: 12 },
    sectionInner: { gap: 6 },
    sectionLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      lineHeight: 16,
    },
    sectionDate: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0,
      textTransform: "none",
    },

    // Winners: their players as links, wrapping, then their club.
    players: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    winnerName: { color: c.ink, fontSize: 14, fontWeight: "700", lineHeight: 18 },
    // 36pt tall plus a 4pt hit slop on each side reaches the 44pt touch target.
    playerLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: c.cream,
      borderWidth: 1,
      borderColor: c.line,
    },
    playerLinkPressed: { backgroundColor: c.line },
    playerLinkLabel: { color: c.ink, fontSize: 14, fontWeight: "700", flexShrink: 1 },
    club: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },

    // Final: the score, then the beaten team.
    finalRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    finalScore: {
      color: c.ink,
      fontSize: 20,
      fontWeight: "800",
      lineHeight: 22,
      fontVariant: ["tabular-nums"],
    },
    teamLines: { flex: 1, minWidth: 0 },
    teamName: { color: c.text, fontSize: 13, fontWeight: "600", lineHeight: 18 },

    facts: { color: c.muted, fontSize: 12, fontWeight: "600", lineHeight: 16 },
  });
