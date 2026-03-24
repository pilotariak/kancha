import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { LaunchScreen } from "@/components/launch-screen";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
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
        {launching ? <LaunchScreen onFinish={handleLaunchFinish} /> : <RootLayoutNav />}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
