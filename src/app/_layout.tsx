import i18n, { hydrationI18n } from "@/i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorScreen } from "@/components/ErrorScreen";
import { LaunchScreen } from "@/components/launch-screen";
import { WebDocumentHead } from "@/components/WebDocumentHead";
import { useTheme } from "@/hooks/use-theme";
import { useLeagueStore } from "@/store/league-store";

// Expo Router renders this instead of a blank screen when any route subtree
// throws during render; exported from the root layout so it catches app-wide.
export { ErrorScreen as ErrorBoundary };

void SplashScreen.preventAutoHideAsync();

// Frontis data changes a few times a day: keep it fresh for 5 minutes, so that
// focusing the browser tab or remounting a screen does not refetch it.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

// Query keys do not include the league (the API client sends it as a header),
// so drop cached data when it changes instead of serving the previous league's
// results as fresh.
useLeagueStore.subscribe((state, prev) => {
  if (state.selectedLeagueId !== prev.selectedLeagueId) void queryClient.resetQueries();
});

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
  // On web the static HTML already holds the route, so show it at once instead
  // of the launch animation. Platform.OS is "web" in both the static render and
  // the browser, so hydration sees the same tree.
  const [launching, setLaunching] = useState(Platform.OS !== "web");
  // False on web until the root has hydrated, so screens hydrate the English
  // static HTML with hydrationI18n. Flipping this state, not the global
  // language, makes React hydrate each pending route boundary with the old
  // value before it applies the switch.
  const [hydrated, setHydrated] = useState(Platform.OS !== "web");

  useEffect(() => {
    void SplashScreen.hideAsync();
    setHydrated(true);
  }, []);

  const handleLaunchFinish = useCallback(() => {
    setLaunching(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <I18nextProvider i18n={hydrated ? i18n : hydrationI18n}>
            <WebDocumentHead />
            {launching ? <LaunchScreen onFinish={handleLaunchFinish} /> : <RootLayoutNav />}
          </I18nextProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
