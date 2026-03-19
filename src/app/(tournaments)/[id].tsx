import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { PhaseHeader } from "@/components/phase-header";
import { Colors } from "@/constants/theme";
import { useMatches } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTournament } from "@/hooks/use-tournaments";
import type { Result, Specialty } from "@/types/competition";
import { parseDateMatch } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, SectionList, Text, TextInput, View } from "react-native";

interface Section {
  title: string;
  data: Result[];
}

function groupByPhase(results: Result[]): Section[] {
  // Sort all results by dateMatch ascending (nulls last)
  const sorted = [...results].sort((a, b) => {
    const da = parseDateMatch(a.dateMatch)?.getTime() ?? Infinity;
    const db = parseDateMatch(b.dateMatch)?.getTime() ?? Infinity;
    return da - db;
  });

  const order: string[] = [];
  const map: Record<string, Result[]> = {};
  for (const r of sorted) {
    const key = r.phase?.trim() || "—";
    if (!map[key]) {
      map[key] = [];
      order.push(key);
    }
    map[key].push(r);
  }
  return order.map((title) => ({ title, data: map[title] }));
}

function SpecialtyCard({
  specialty,
  onPress,
}: {
  specialty: Specialty;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        if (process.env.EXPO_OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: 14,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: Colors.cardBorder,
          flexDirection: "row",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Left accent */}
        <View style={{ width: 4, backgroundColor: Colors.verde, alignSelf: "stretch" }} />

        {/* Icon */}
        <View
          style={{
            width: 44,
            height: 44,
            margin: 14,
            borderRadius: 12,
            borderCurve: "continuous",
            backgroundColor: Colors.verdeGlow,
            borderWidth: 1,
            borderColor: "rgba(26,102,64,0.3)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22 }}>🏸</Text>
        </View>

        {/* Name */}
        <Text
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: "700",
            color: Colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {specialty.name}
        </Text>

        {/* Arrow */}
        <Text style={{ fontSize: 20, color: Colors.verdeBright, paddingHorizontal: 16 }}>›</Text>
      </View>
    </Pressable>
  );
}

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

  const sections = useMemo(() => groupByPhase(results ?? []), [results]);
  const selectedSpecialty = specialties?.find((s) => s.id === specialtyId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!competition) return null;

  return (
    <>
      <Stack.Screen options={{ title: competition.name }} />
      <View style={{ flex: 1, backgroundColor: Colors.ink }}>
        {/* ── Specialty picker ── */}
        {!specialtyId
          ? (
            <FlatList
              data={specialties ?? []}
              keyExtractor={(item) => item.id}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ padding: 16, gap: 10 }}
              ListHeaderComponent={
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.textMuted,
                    marginBottom: 4,
                    letterSpacing: 0.4,
                  }}
                >
                  Select a specialty to view results
                </Text>
              }
              renderItem={({ item }) => (
                <SpecialtyCard
                  specialty={item}
                  onPress={() => setSpecialtyId(item.id)}
                />
              )}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingTop: 48, gap: 10 }}>
                  <Text style={{ fontSize: 40 }}>🏸</Text>
                  <Text style={{ fontSize: 15, color: Colors.textMuted }}>
                    No specialties found
                  </Text>
                </View>
              }
            />
          )
          : (
            <>
              {/* ── Selected specialty header ── */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: Colors.filterBackground,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.filterBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* Selected specialty pill */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: Colors.verdeGlow,
                    borderWidth: 1,
                    borderColor: "rgba(26,102,64,0.3)",
                    borderRadius: 10,
                    borderCurve: "continuous",
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.verdeBright }}>
                    {selectedSpecialty?.name}
                  </Text>
                </View>

                {/* Change button */}
                <Pressable
                  onPress={() => {
                    setSpecialtyId(undefined);
                    setCategory("");
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: Colors.chipInactive,
                    borderWidth: 1,
                    borderColor: Colors.filterBorder,
                    borderRadius: 10,
                    borderCurve: "continuous",
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary }}>
                    Change
                  </Text>
                </Pressable>
              </View>

              {/* ── Category input ── */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: Colors.filterBackground,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.filterBorder,
                }}
              >
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Category (e.g. Seniors, Cadets…)"
                  placeholderTextColor={Colors.inputPlaceholder}
                  returnKeyType="search"
                  style={{
                    backgroundColor: Colors.inputBackground,
                    borderRadius: 10,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: Colors.filterBorder,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: Colors.inputText,
                  }}
                />
              </View>

              {/* ── Results ── */}
              {resultsLoading
                ? <LoadingState message="Loading results…" />
                : (
                  <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({ section }) => (
                      <PhaseHeader phase={section.title} matchCount={section.data.length} />
                    )}
                    renderItem={({ item }) => (
                      <View style={{ marginBottom: 8 }}>
                        <MatchCard match={item} hidePhase />
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={{ alignItems: "center", paddingTop: 56, gap: 12 }}>
                        <Text style={{ fontSize: 44 }}>🔎</Text>
                        <Text
                          style={{ fontSize: 16, fontWeight: "600", color: Colors.textSecondary }}
                        >
                          No results found
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textMuted }}>
                          Try a different category
                        </Text>
                      </View>
                    }
                  />
                )}
            </>
          )}
      </View>
    </>
  );
}
