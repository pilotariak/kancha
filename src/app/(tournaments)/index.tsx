import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { TournamentCard } from "@/components/tournament-card";
import { Colors } from "@/constants/theme";
import { useTournaments } from "@/hooks/use-tournaments";
import { Link, useSegments } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function TournamentsScreen() {
  const segment = useSegments()[0] ?? "(tournaments)";
  const { data: tournaments, isLoading, error, refetch } = useTournaments();

  if (isLoading) return <LoadingState message="Loading tournaments..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <Link href={`/${segment}/results`} asChild>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: Colors.verde,
                padding: 14,
                borderRadius: 12,
                borderCurve: "continuous",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 36, marginRight: 12 }}>🏆</Text>
              <View>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  View All Results
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                  Search by competition, specialty...
                </Text>
              </View>
            </Pressable>
          </Link>
        }
        renderItem={({ item }) => <TournamentCard tournament={item} segment={segment} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <Text style={{ fontSize: 16, color: Colors.textMuted }}>No tournaments found</Text>
          </View>
        }
      />
    </View>
  );
}
