import { Colors } from "@/constants/theme";
import { type Href, Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: Colors.ink,
        }}
      >
        <Text style={{ fontSize: 48 }}>🎾</Text>
        <Text style={{ fontSize: 20, fontWeight: "700", color: Colors.textPrimary }}>
          Page not found
        </Text>
        <Link
          href={"/(tournaments)" as Href}
          style={{ color: Colors.verdeBright, fontSize: 15, fontWeight: "500" }}
        >
          Go back home
        </Link>
      </View>
    </>
  );
}
