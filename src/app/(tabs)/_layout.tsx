import { Tabs } from "expo-router";
import { CalendarRange, Swords, Trophy, UserCircle2 } from "lucide-react-native";
import React from "react";

import Colors, { KanchaColors } from "@/constants/colors";

export default function TabLayout() {
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
          title: "Competitions",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Tournaments",
          tabBarIcon: ({ color, size }) => <Swords color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color, size }) => <CalendarRange color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <UserCircle2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
