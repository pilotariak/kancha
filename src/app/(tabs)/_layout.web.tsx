import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Info, Swords, Trophy } from "@/components/icons";
import { KanchaLogo } from "@/components/KanchaLogo";
import { RAIL_WIDTH } from "@/features/layout/breakpoints";
import { useWebLayout } from "@/hooks/use-layout";
import { useTheme } from "@/hooks/use-theme";

const LOGO_SIZE = 48;
const LOGO_TOP = 20;
const LOGO_BOTTOM = 16;

/**
 * The web tabs. Expo Router picks this file over `_layout.tsx` on web only, so iOS and
 * Android keep theirs. The same bottom tab bar as on a phone until two card columns fit
 * beside a rail (`RAIL_MIN_WIDTH`); then a navigation rail on the left, under the Kancha logo.
 */
export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { rail } = useWebLayout();

  return (
    <Tabs
      screenOptions={rail
        ? {
          headerShown: false,
          // The material variant is only valid with a left or right position.
          tabBarPosition: "left",
          tabBarVariant: "material",
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.text,
          tabBarActiveBackgroundColor: colors.redSoft,
          tabBarStyle: {
            width: RAIL_WIDTH,
            minWidth: RAIL_WIDTH,
            paddingTop: LOGO_TOP + LOGO_SIZE + LOGO_BOTTOM,
            paddingStart: 8,
            paddingEnd: 8,
            backgroundColor: colors.tabBar,
            borderRightColor: colors.tabBarBorder,
          },
          // The tab bar has no header slot: the logo sits on its background layer, and
          // paddingTop moves the tabs below it.
          tabBarBackground: () => (
            <View style={styles.logo}>
              <KanchaLogo size={LOGO_SIZE} variant={isDark ? "on-dark" : "on-light"} />
            </View>
          ),
          tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        }
        : {
          headerShown: false,
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.tabIconInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            // The default 49px bar clips the 12px label under its 8px bottom padding. A custom
            // height replaces the default one as-is, so it must include the bottom inset.
            height: 64 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            paddingBottom: 8,
          },
        }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="competitions"
        options={{
          title: t("tabs.competitions"),
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="slot" options={{ href: null }} />
      <Tabs.Screen
        name="score"
        options={{
          title: t("score.tab"),
          tabBarIcon: ({ color, size }) => <Swords color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.about"),
          tabBarIcon: ({ color, size }) => <Info color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: "center", paddingTop: LOGO_TOP },
});
