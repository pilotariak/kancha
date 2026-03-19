import { Colors } from "@/constants/theme";
import type { Competition } from "@/types/competition";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface TournamentCardProps {
  tournament: Competition;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link href={`/(tournaments)/${tournament.id}` as Href} asChild>
      <Pressable
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            flexDirection: "row",
            overflow: "hidden",
          }}
        >
          {/* Left accent bar */}
          <View style={{ width: 4, backgroundColor: Colors.accentBar }} />

          {/* Icon column */}
          <View
            style={{
              paddingLeft: 14,
              paddingVertical: 16,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                borderCurve: "continuous",
                backgroundColor: Colors.verdeGlow,
                borderWidth: 1,
                borderColor: "rgba(26, 102, 64, 0.3)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>🏆</Text>
            </View>
          </View>

          {/* Text content */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 12,
              paddingVertical: 16,
              gap: 6,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.textPrimary,
                lineHeight: 21,
              }}
              numberOfLines={2}
            >
              {tournament.name}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.verdeBright, fontWeight: "500" }}>
              Tap to browse results →
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
