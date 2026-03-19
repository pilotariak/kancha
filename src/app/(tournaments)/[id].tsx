import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { Colors } from "@/constants/theme";
import { useMatches } from "@/hooks/use-matches";
import { useTournament } from "@/hooks/use-tournaments";
import { Stack, useLocalSearchParams, useSegments } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const segment = useSegments()[0] ?? "(tournaments)";

  const { data: competition, isLoading, error, refetch } = useTournament(id);
  const { data: results, isLoading: resultsLoading } = useMatches({ competitionId: id });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!competition) return null;

  return (
    <>
      <Stack.Screen options={{ title: competition.name }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: Colors.ink }}
      >
        <View style={{ padding: 16, gap: 20 }}>
          {/* Competition info */}
          <View
            style={{
              backgroundColor: Colors.cardBackground,
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: Colors.cardBorder,
              padding: 16,
              gap: 12,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: Colors.textMuted,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                YEAR
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.textPrimary }}>
                {competition.year}
              </Text>
            </View>

            {competition.level && (
              <View style={{ gap: 4 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: Colors.textMuted,
                    fontWeight: "700",
                    letterSpacing: 1,
                  }}
                >
                  LEVEL
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.textPrimary }}>
                  {competition.level}
                </Text>
              </View>
            )}
          </View>

          {/* Results */}
          <View style={{ gap: 12 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}
            >
              Results
            </Text>
            {resultsLoading
              ? <LoadingState message="Loading results..." />
              : results?.length
              ? results.map((result) => (
                <MatchCard key={result.id} match={result} segment={segment} />
              ))
              : (
                <Text
                  style={{
                    color: Colors.textMuted,
                    textAlign: "center",
                    paddingVertical: 24,
                  }}
                >
                  No results yet
                </Text>
              )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
