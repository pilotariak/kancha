import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

const labelColor = process.env.EXPO_OS === "web"
  ? "#000"
  : PlatformColor("label") as never;

export default function TournamentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: labelColor },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tournaments" }} />
      <Stack.Screen name="results" options={{ title: "Results", headerLargeTitle: false }} />
      <Stack.Screen name="[id]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
