import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { useMatches } from "@/hooks/use-matches";
import { useTournament } from "@/hooks/use-tournaments";
import { MODALITY_LABELS } from "@/types/tournament";
import { Stack, useLocalSearchParams, useSegments } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const segment = useSegments()[0] ?? "(tournaments)";

  const { data: tournament, isLoading, error, refetch } = useTournament(id);
  const { data: matches, isLoading: matchesLoading } = useMatches({ tournamentId: id });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!tournament) return null;

  return (
    <>
      <Stack.Screen options={{ title: tournament.name }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ padding: 16, gap: 20 }}>
          {/* Tournament info */}
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
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>MODALITY</Text>
              <Text style={{ fontSize: 15, fontWeight: "600" }}>
                {MODALITY_LABELS[tournament.modality]}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>DATES</Text>
              <Text selectable style={{ fontSize: 15, fontWeight: "600" }}>
                {new Date(tournament.startDate).toLocaleDateString()} –{" "}
                {new Date(tournament.endDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>LOCATION</Text>
              <Text selectable style={{ fontSize: 15, fontWeight: "600" }}>
                {tournament.location}
              </Text>
            </View>

            {tournament.teamsCount !== undefined && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>TEAMS</Text>
                <Text style={{ fontSize: 15, fontWeight: "600" }}>{tournament.teamsCount}</Text>
              </View>
            )}

            {tournament.description && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>
                  DESCRIPTION
                </Text>
                <Text selectable style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}>
                  {tournament.description}
                </Text>
              </View>
            )}
          </View>

          {/* Matches */}
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Matches</Text>
            {matchesLoading ? <LoadingState message="Loading matches..." /> : matches?.length
              ? (
                matches.map((match) => <MatchCard key={match.id} match={match} segment={segment} />)
              )
              : (
                <Text style={{ color: "#9CA3AF", textAlign: "center", paddingVertical: 24 }}>
                  No matches yet
                </Text>
              )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
