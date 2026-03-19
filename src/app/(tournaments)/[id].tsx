import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { Colors } from "@/constants/theme";
import { useMatches } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTournament } from "@/hooks/use-tournaments";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [specialtyId, setSpecialtyId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>("");

  const { data: competition, isLoading, error, refetch } = useTournament(id);
  const { data: specialties } = useSpecialties();
  const { data: results, isLoading: resultsLoading } = useMatches(
    { competitionId: id, specialtyId, category: category.trim() || undefined },
    { enabled: !!specialtyId },
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!competition) return null;

  return (
    <>
      <Stack.Screen options={{ title: competition.name }} />
      <View style={{ flex: 1, backgroundColor: Colors.ink }}>
        {/* Filters */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
            backgroundColor: Colors.filterBackground,
            borderBottomWidth: 1,
            borderBottomColor: Colors.filterBorder,
          }}
        >
          {/* Specialty chips */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: Colors.textMuted,
                marginLeft: 4,
                letterSpacing: 0.8,
              }}
            >
              SPÉCIALITÉ
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {(specialties ?? []).map((s) => {
                  const active = specialtyId === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setSpecialtyId(active ? undefined : s.id)}
                      style={({ pressed }) => ({
                        backgroundColor: active ? Colors.chipActive : Colors.chipInactive,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: active ? Colors.chipActiveText : Colors.chipInactiveText,
                        }}
                      >
                        {s.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Category input — only shown once a specialty is chosen */}
          {specialtyId && (
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Catégorie (ex: Seniors, Cadets…)"
              placeholderTextColor={Colors.inputPlaceholder}
              returnKeyType="search"
              style={{
                backgroundColor: Colors.inputBackground,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.filterBorder,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 13,
                color: Colors.inputText,
              }}
            />
          )}
        </View>

        {/* Results */}
        {!specialtyId
          ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🏸</Text>
              <Text style={{ fontSize: 15, color: Colors.textMuted }}>
                Select a specialty to view results
              </Text>
            </View>
          )
          : resultsLoading
          ? <LoadingState message="Loading results..." />
          : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ padding: 16, gap: 12 }}
              renderItem={({ item }) => <MatchCard match={item} />}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
                  <Text style={{ fontSize: 40 }}>🔎</Text>
                  <Text style={{ fontSize: 16, color: Colors.textMuted }}>No results found</Text>
                </View>
              }
            />
          )}
      </View>
    </>
  );
}
