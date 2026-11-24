import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { androidTabIcon } from "@/components/android-tab-icon";
import { useTheme } from "@/hooks/use-theme";

/**
 * The iOS and Android tabs: the system tab bar (Liquid Glass on iOS 26) and the Material 3
 * bottom navigation. Web uses `_layout.web.tsx`.
 *
 * Native tabs register only the routes that have a Trigger, so `index` (a redirect) is no tab
 * at all. Competitions comes first: a launch on `/` lands on it, and it is the route the tabs go
 * back to. Créneaux (`slot`) comes second, as on the web.
 *
 * iOS sets only the selected tint: a background, blur or label color would replace the system
 * glass. Android takes the colors of the former JS tab bar, with the redSoft pill of the web rail
 * and the cards' ripple: without `rippleColor`, react-native-screens reads `itemRippleColor`
 * from the Material 3 theme, which does not define it, and the press shows no ripple.
 */
export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const androidColors = Platform.OS === "android"
    ? {
      backgroundColor: colors.tabBar,
      iconColor: colors.tabIconInactive,
      labelStyle: { color: colors.tabIconInactive, fontSize: 12, fontWeight: "700" },
      indicatorColor: colors.redSoft,
      rippleColor: colors.ripple,
    } as const
    : undefined;

  return (
    <NativeTabs tintColor={colors.red} minimizeBehavior="onScrollDown" {...androidColors}>
      <NativeTabs.Trigger name="competitions">
        <Label>{t("tabs.competitions")}</Label>
        <Icon
          sf={{ default: "trophy", selected: "trophy.fill" }}
          androidSrc={androidTabIcon("trophy-outline")}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="slot">
        <Label>{t("tabs.slot")}</Label>
        {/* SF Symbols has no filled calendar.badge.clock: the same symbol in both states. */}
        <Icon sf="calendar.badge.clock" androidSrc={androidTabIcon("calendar-clock-outline")} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="score">
        <Label>{t("score.tab")}</Label>
        <Icon
          sf={{ default: "sportscourt", selected: "sportscourt.fill" }}
          androidSrc={androidTabIcon("sword-cross")}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>{t("tabs.about")}</Label>
        <Icon
          sf={{ default: "info.circle", selected: "info.circle.fill" }}
          androidSrc={androidTabIcon("information-outline")}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
