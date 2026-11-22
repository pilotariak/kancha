import { type Href, Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import type { Club } from "@/types/competition";

export const clubHref = (id: string): Extract<Href, string> => `/(tabs)/competitions/club?id=${id}`;

interface ClubLinkProps {
  club: Club;
  /** The name's text style, as it looks where it sits. */
  textStyle: StyleProp<TextStyle>;
  /** The link's box, inside its row or column. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A club name that opens the club page. On web it is a real link to the club URL (`<a href>`,
 * without the `(tabs)` group), which a click or Enter follows in the app and the browser can
 * open in a new tab. The press stays with the name: the Pressable takes the touch on iOS and
 * Android, and stops the click on web, so a card or row around it does not open too.
 */
export function ClubLink({ club, textStyle, style, testID }: ClubLinkProps) {
  const { t } = useTranslation();
  const interaction = useInteractionStyles();

  // The Link passes its href, role and press handler through a Slot, which spreads the child's
  // style into an object: an array style would turn into indexed keys (a crash on web) and a
  // style callback would be lost. So the box style is flattened, and the states style the name.
  return (
    <Link href={clubHref(club.id)} push asChild>
      <Pressable
        style={StyleSheet.flatten([styles.link, style])}
        hitSlop={8}
        accessibilityHint={t("club.open_hint")}
        testID={testID}
      >
        {(state: InteractionState) => (
          <Text
            style={[
              textStyle,
              (state.hovered || state.pressed) && styles.active,
              showsFocusRing(state) && interaction.focusRing,
            ]}
          >
            {club.name}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    maxWidth: "100%",
    flexShrink: 1,
    // The name draws the focus ring: no browser outline around the link as well.
    ...(Platform.OS === "web" && ({ outlineStyle: "none" } as unknown as ViewStyle)),
  },
  active: { textDecorationLine: "underline" },
});
