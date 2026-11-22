import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

import { Star } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { type InteractionState, showsFocusRing } from "@/hooks/use-interaction-styles";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import {
  type Favourite,
  selectIsFollowed,
  useFavouritesHydrated,
  useFavouritesStore,
} from "@/store/favourites-store";
import { useLeagueStore } from "@/store/league-store";

interface FollowButtonProps {
  /** The club, player or category to follow, with the names the followed list shows. */
  favourite: Favourite;
  /** What it follows, in the accessibility label: the club, the player, the specialty and category. */
  name: string;
  testID?: string;
}

/**
 * "Suivre" / "Suivi": follows or unfollows a club, a player or a category in the selected
 * league, for the header band's `action` slot. Hidden until the league and the saved favourites
 * load, so it never shows a wrong state. A Pressable keeps the press: on web its click does not
 * bubble, so a card or row around it does not open too.
 */
export function FollowButton({ favourite, name, testID }: FollowButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const leagueId = useLeagueStore((s) => s.selectedLeagueId);
  const hydrated = useFavouritesHydrated();
  const followed = useFavouritesStore(selectIsFollowed(leagueId, favourite));
  const toggle = useFavouritesStore((s) => s.toggle);

  if (!leagueId || !hydrated) return null;

  const iconColor = followed ? colors.redFill : colors.onRedStrong;
  return (
    <Pressable
      style={(state: InteractionState) => [
        styles.button,
        followed && styles.buttonOn,
        (state.hovered || state.pressed)
        && (followed ? styles.buttonOnActive : styles.buttonActive),
        showsFocusRing(state) && styles.focusRing,
      ]}
      onPress={() => toggle(leagueId, favourite)}
      accessibilityRole="button"
      accessibilityLabel={t(followed ? "follow.following_a11y" : "follow.follow_a11y", { name })}
      // accessibilityState never reaches the DOM on web: aria-pressed carries the state there.
      accessibilityState={{ selected: followed }}
      {...(Platform.OS === "web" ? { "aria-pressed": followed } : null)}
      testID={testID}
    >
      <Star color={iconColor} fill={followed ? iconColor : "none"} size={18} />
      <Text style={[styles.label, followed && styles.labelOn]} numberOfLines={1}>
        {followed ? t("follow.following") : t("follow.follow")}
      </Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    // On the red band. 44px high at least: the touch target, without hitSlop, which web ignores.
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      gap: 6,
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: 14,
      borderRadius: 9999,
      borderWidth: 1.5,
      borderColor: c.onRedSoft,
    },
    buttonActive: { backgroundColor: c.redDark },
    // Followed: a filled pill, as a selected chip.
    buttonOn: { backgroundColor: c.onRedStrong, borderColor: c.onRedStrong },
    buttonOnActive: { backgroundColor: c.onRedSoft, borderColor: c.onRedSoft },
    // The red ring would not show on the band.
    focusRing: {
      outlineColor: c.onRedStrong,
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 2,
    },
    label: { color: c.onRedStrong, fontSize: 15, fontWeight: "700" },
    labelOn: { color: c.redFill },
  });
