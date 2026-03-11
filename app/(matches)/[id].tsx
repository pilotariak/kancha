import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ScoreBadge } from "@/components/score-badge";
import { useMatch } from "@/hooks/use-matches";
import { MODALITY_LABELS } from "@/types/tournament";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

const STATUS_STYLES = {
  scheduled: { color: "#6B7280", label: "Scheduled" },
  live: { color: "#EF4444", label: "● Live" },
  completed: { color: "#10B981", label: "Final" },
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: match, isLoading, error, refetch } = useMatch(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!match) return null;

  const status = STATUS_STYLES[match.status];

  return (
    <>
      <Stack.Screen
        options={{
          title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 16, gap: 16 }}>
          {/* Score card */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              borderCurve: "continuous",
              padding: 24,
              alignItems: "center",
              gap: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            <Text style={{ fontSize: 12, color: status.color, fontWeight: "600" }}>
              {status.label}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <Text
                style={{ flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" }}
                numberOfLines={2}
              >
                {match.homeTeam.name}
              </Text>

              {match.score
                ? <ScoreBadge score={match.score} size="lg" />
                : <Text style={{ fontSize: 18, color: "#9CA3AF" }}>vs</Text>}

              <Text
                style={{ flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" }}
                numberOfLines={2}
              >
                {match.awayTeam.name}
              </Text>
            </View>

            <Text style={{ fontSize: 13, color: "#9CA3AF" }}>
              {MODALITY_LABELS[match.modality]}
            </Text>
          </View>

          {/* Set-by-set scores */}
          {match.sets && match.sets.length > 0 && (
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
              <Text style={{ fontSize: 15, fontWeight: "700" }}>Sets</Text>
              {match.sets.map((set, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>Set {index + 1}</Text>
                  <ScoreBadge score={set} size="sm" />
                </View>
              ))}
            </View>
          )}

          {/* Match details */}
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
            <Text style={{ fontSize: 15, fontWeight: "700" }}>Details</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#9CA3AF" }}>Date</Text>
              <Text selectable style={{ fontSize: 13, fontWeight: "500" }}>
                {new Date(match.date).toLocaleString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {match.court && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#9CA3AF" }}>Court</Text>
                <Text selectable style={{ fontSize: 13, fontWeight: "500" }}>{match.court}</Text>
              </View>
            )}

            {match.tournamentName && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#9CA3AF" }}>Tournament</Text>
                <Text selectable style={{ fontSize: 13, fontWeight: "500" }}>
                  {match.tournamentName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
