import { Colors } from "@/constants/theme";
import type { Club } from "@/types/competition";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface ClubCardProps {
  club: Club;
  segment: string;
}

export function ClubCard({ club, segment }: ClubCardProps) {
  const initials = club.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link href={`/${segment}/${club.id}` as Href} asChild>
      <Pressable
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.selectionAsync();
          }
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.verdeGlow,
              borderWidth: 1,
              borderColor: "rgba(26, 102, 64, 0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.verdeBright }}>
              {initials}
            </Text>
          </View>

          <Text
            style={{ fontSize: 15, fontWeight: "600", flex: 1, color: Colors.textPrimary }}
            numberOfLines={2}
          >
            {club.name}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
