import { Tabs } from "expo-router";
import { CalendarClock, Info, Swords, Trophy } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import Colors, { KanchaColors } from "@/constants/colors";

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: KanchaColors.white,
          borderTopColor: "#E9E0D6",
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
      <Tabs.Screen
        name="slot"
        options={{
          title: t("tabs.slot"),
          tabBarIcon: ({ size }) => <CalendarClock color={KanchaColors.muted} size={size} />,
          tabBarButton: () => (
            <View pointerEvents="none" style={styles.disabledTab}>
              <CalendarClock color={KanchaColors.muted} size={24} />
              <Text style={styles.disabledTabLabel}>{t("tabs.slot")}</Text>
              <Text style={styles.disabledTabBadge}>{t("tabs.soon")}</Text>
            </View>
          ),
        }}
      />
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
  disabledTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    gap: 2,
    opacity: 0.45,
  },
  disabledTabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: KanchaColors.muted,
  },
  disabledTabBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: KanchaColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 1,
  },
});
