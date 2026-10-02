import "@/i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LaunchScreen } from "@/components/launch-screen";
import { useTheme } from "@/hooks/use-theme";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerBackTitle: t("common.back"),
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.red,
        headerTitleStyle: { color: colors.ink },
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [launching, setLaunching] = useState(true);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const handleLaunchFinish = useCallback(() => {
    setLaunching(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          {launching ? <LaunchScreen onFinish={handleLaunchFinish} /> : <RootLayoutNav />}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
