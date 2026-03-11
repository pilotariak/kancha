import { MODALITY_LABELS } from "@/types/tournament";
import type { Tournament } from "@/types/tournament";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

const STATUS_STYLES: Record<
  Tournament["status"],
  { bg: string; text: string; label: string }
> = {
  upcoming: { bg: "#EFF6FF", text: "#3B82F6", label: "Upcoming" },
  active: { bg: "#ECFDF5", text: "#10B981", label: "Active" },
  completed: { bg: "#F3F4F6", text: "#6B7280", label: "Completed" },
};

interface TournamentCardProps {
  tournament: Tournament;
  segment: string;
}

export function TournamentCard({ tournament, segment }: TournamentCardProps) {
  const status = STATUS_STYLES[tournament.status];

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
            backgroundColor: "#fff",
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 16,
            gap: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
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
            <Text style={{ fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={2}>
              {tournament.name}
            </Text>
            <View
              style={{
                backgroundColor: status.bg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: status.text }}>
                {status.label}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>
            {MODALITY_LABELS[tournament.modality]}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
              {new Date(tournament.startDate).toLocaleDateString()} –{" "}
              {new Date(tournament.endDate).toLocaleDateString()}
            </Text>
            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
              {tournament.location}
            </Text>
          </View>

          {tournament.teamsCount !== undefined && (
            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
              {tournament.teamsCount} teams
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
