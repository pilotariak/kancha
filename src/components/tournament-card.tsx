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
          <Text
            style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}
            numberOfLines={2}
          >
            {tournament.name}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
