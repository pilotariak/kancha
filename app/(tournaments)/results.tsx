import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { Colors } from "@/constants/theme";
import { useMatches } from "@/hooks/use-matches";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTournaments } from "@/hooks/use-tournaments";
import { useSegments } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const PHASES = [
  { id: "0", label: "Toutes phases" },
  { id: "Poule", label: "Poule" },
  { id: "Barrage", label: "Barrage" },
  { id: "1/2 Finale", label: "1/2 Finale" },
  { id: "Finale", label: "Finale" },
];

export default function ResultsScreen() {
  const segment = useSegments()[0] ?? "(tournaments)";

  const [competitionId, setCompetitionId] = useState<string | undefined>(undefined);
  const [specialtyId, setSpecialtyId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>("");
  const [phase, setPhase] = useState<string>("0");

  const { data: competitions } = useTournaments();
  const { data: specialties } = useSpecialties();
  const { data: matches, isLoading, error, refetch } = useMatches({
    competitionId,
    specialtyId,
    category: category.trim() || undefined,
    phase: phase === "0" ? undefined : phase,
  });

  if (isLoading && !matches) return <LoadingState message="Fetching results..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      {/* Filter bar */}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <FilterChips
              label="Competition"
              value={competitionId ?? "0"}
              options={[
                { id: "0", label: "Toutes" },
                ...(competitions?.map((c) => ({ id: c.id, label: `${c.name} ${c.year}` })) ?? []),
              ]}
              onSelect={(val) => setCompetitionId(val === "0" ? undefined : val)}
            />
            <FilterChips
              label="Spécialité"
              value={specialtyId ?? "0"}
              options={[
                { id: "0", label: "Toutes" },
                ...(specialties?.map((s) => ({ id: s.id, label: s.name })) ?? []),
              ]}
              onSelect={(val) => setSpecialtyId(val === "0" ? undefined : val)}
            />
            <FilterChips
              label="Phase"
              value={phase}
              options={PHASES}
              onSelect={setPhase}
            />
          </View>
        </ScrollView>

        {/* Category free-text */}
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Catégorie (ex: 1ère Série, Cadets…)"
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
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <MatchCard match={item} segment={segment} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🔎</Text>
            <Text style={{ fontSize: 16, color: Colors.textMuted }}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

function FilterChips({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onSelect: (val: string) => void;
}) {
  return (
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
        {label.toUpperCase()}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              style={({ pressed }) => ({
                backgroundColor: value === opt.id ? Colors.chipActive : Colors.chipInactive,
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
                  color: value === opt.id ? Colors.chipActiveText : Colors.chipInactiveText,
                }}
              >
                {opt.label.length > 24 ? opt.label.slice(0, 24) + "…" : opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
