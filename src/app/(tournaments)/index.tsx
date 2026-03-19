import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { TournamentCard } from "@/components/tournament-card";
import { Colors } from "@/constants/theme";
import { useTournaments } from "@/hooks/use-tournaments";
import { FlatList, Text, View } from "react-native";

export default function TournamentsScreen() {
  const { data: tournaments, isLoading, error, refetch } = useTournaments();

  if (isLoading) return <LoadingState message="Loading tournaments..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        ListHeaderComponent={tournaments && tournaments.length > 0
          ? (
            <View style={{ paddingBottom: 4 }}>
              <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: "500" }}>
                {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )
          : null}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 64, gap: 12 }}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
            <Text style={{ fontSize: 17, fontWeight: "600", color: Colors.textSecondary }}>
              No tournaments yet
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: "center" }}>
              Check back later for upcoming competitions
            </Text>
          </View>
        }
      />
    </View>
  );
}
