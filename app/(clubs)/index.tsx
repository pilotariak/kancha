import { ClubCard } from "@/components/club-card";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Colors } from "@/constants/theme";
import { useClubs } from "@/hooks/use-clubs";
import { useSegments } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function ClubsScreen() {
  const segment = useSegments()[0] ?? "(clubs)";
  const { data: clubs, isLoading, error, refetch } = useClubs();

  if (isLoading) return <LoadingState message="Loading clubs..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <FlatList
      data={clubs}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: Colors.ink }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => <ClubCard club={item} segment={segment} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
          <Text style={{ fontSize: 40 }}>🏟️</Text>
          <Text style={{ fontSize: 16, color: Colors.textMuted }}>No clubs found</Text>
        </View>
      }
    />
  );
}
