import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { useMatches } from "@/hooks/use-matches";
import type { MatchStatus } from "@/types/match";
import { useSegments } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const FILTERS: { label: string; value: MatchStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Live", value: "live" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Final", value: "completed" },
];

export default function MatchesScreen() {
  const segment = useSegments()[0] ?? "(matches)";
  const [statusFilter, setStatusFilter] = useState<MatchStatus | undefined>(undefined);
  const { data: matches, isLoading, error, refetch } = useMatches({ status: statusFilter });

  if (isLoading) return <LoadingState message="Loading matches..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      ListHeaderComponent={
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingBottom: 4,
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <Pressable
                key={filter.label}
                onPress={() => setStatusFilter(filter.value)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: active ? "#1D4ED8" : "#F3F4F6",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                })}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: active ? "#fff" : "#374151",
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      }
      renderItem={({ item }) => <MatchCard match={item} segment={segment} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
          <Text style={{ fontSize: 40 }}>🎾</Text>
          <Text style={{ fontSize: 16, color: "#9CA3AF" }}>No matches found</Text>
        </View>
      }
    />
  );
}
