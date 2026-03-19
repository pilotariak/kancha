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
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
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
