import type { Match } from "@/types/match";
import { MODALITY_LABELS } from "@/types/tournament";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ScoreBadge } from "./score-badge";

const STATUS_STYLES: Record<
  Match["status"],
  { color: string; label: string }
> = {
  scheduled: { color: "#6B7280", label: "Scheduled" },
  live: { color: "#EF4444", label: "● Live" },
  completed: { color: "#10B981", label: "Final" },
};

interface MatchCardProps {
  match: Match;
  segment: string;
}

export function MatchCard({ match, segment }: MatchCardProps) {
  const status = STATUS_STYLES[match.status];

  return (
    <Link href={`/${segment}/${match.id}` as Href} asChild>
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
            gap: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <Text style={{ fontSize: 12, color: status.color, fontWeight: "600" }}>
              {status.label}
            </Text>
            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
              {new Date(match.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <Text
              style={{ flex: 1, fontSize: 15, fontWeight: "600" }}
              numberOfLines={1}
            >
              {match.homeTeam.name}
            </Text>

            {match.score
              ? <ScoreBadge score={match.score} size="sm" />
              : <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>vs</Text>}

            <Text
              style={{ flex: 1, fontSize: 15, fontWeight: "600", textAlign: "right" }}
              numberOfLines={1}
            >
              {match.awayTeam.name}
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
            {MODALITY_LABELS[match.modality]}
            {match.tournamentName ? ` · ${match.tournamentName}` : ""}
            {match.court ? ` · ${match.court}` : ""}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
