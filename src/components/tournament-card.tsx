import { Colors } from "@/constants/theme";
import type { Competition } from "@/types/competition";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface TournamentCardProps {
  tournament: Competition;
  segment: string;
}

export function TournamentCard({ tournament, segment }: TournamentCardProps) {
  return (
    <Link href={`/${segment}/${tournament.id}` as Href} asChild>
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
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "700", flex: 1, color: Colors.textPrimary }}
              numberOfLines={2}
            >
              {tournament.name}
            </Text>
            <View
              style={{
                backgroundColor: Colors.verdeGlow,
                borderWidth: 1,
                borderColor: "rgba(26, 102, 64, 0.35)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.verdeBright }}>
                {tournament.year}
              </Text>
            </View>
          </View>

          {tournament.level && (
            <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: "500" }}>
              {tournament.level}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
