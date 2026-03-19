import { Colors } from "@/constants/theme";
import { Stack } from "expo-router/stack";

export default function ClubsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: Colors.paper },
        headerLargeTitleStyle: { color: Colors.paper },
        headerTintColor: Colors.verdeBright,
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Clubs" }} />
      <Stack.Screen name="[id]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
