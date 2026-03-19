import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { Colors } from "@/constants/theme";
import { useClub } from "@/hooks/use-clubs";
import { useMatches } from "@/hooks/use-matches";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: club, isLoading: clubLoading, error: clubError, refetch } = useClub(id);
  const { data: allMatches, isLoading: matchesLoading } = useMatches();

  const clubMatches = useMemo(
    () => allMatches?.filter((r) => r.clubA.id === id || r.clubB.id === id) ?? [],
    [allMatches, id],
  );

  if (clubLoading || matchesLoading) return <LoadingState />;
  if (clubError) return <ErrorState message={clubError.message} onRetry={refetch} />;
  if (!club) return null;

  const initials = club.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <Stack.Screen options={{ title: club.name }} />
      <FlatList
        data={clubMatches}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: Colors.ink }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View
            style={{
              backgroundColor: Colors.cardBackground,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: Colors.cardBorder,
              padding: 24,
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: Colors.verdeGlow,
                borderWidth: 1,
                borderColor: "rgba(26, 102, 64, 0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.verdeBright }}>
                {initials}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                color: Colors.textPrimary,
              }}
            >
              {club.name}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>
              {clubMatches.length} résultat{clubMatches.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => <MatchCard match={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 32, gap: 8 }}>
            <Text style={{ fontSize: 32 }}>🏟️</Text>
            <Text style={{ fontSize: 15, color: Colors.textMuted }}>
              Aucun résultat pour ce club
            </Text>
          </View>
        }
      />
    </>
  );
}
