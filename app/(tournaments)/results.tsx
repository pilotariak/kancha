import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MatchCard } from "@/components/match-card";
import { useMatches } from "@/hooks/use-matches";
import { useTournaments } from "@/hooks/use-tournaments";
import { useSegments } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

const SPECIALTIES = [
  { id: "0", label: "Toutes" },
  { id: "2", label: "Mur à Gauche / P.G. Creuse Masculin Individuel" },
  { id: "1", label: "Trinquet / P.G. Creuse Masculin" },
  { id: "3", label: "Trinquet / P.G. Creuse Masculin Brassage Jeunes" },
  { id: "4", label: "Trinquet / P.G. Pleine Masculin" },
];

const CATEGORIES = [
  { id: "0", label: "Toutes catégories" },
  { id: "1", label: "M16 (Minime 14-15)" },
  { id: "2", label: "M14 (Benjamin 12-13)" },
  { id: "3", label: "M12 (Poussin 10-11)" },
  { id: "4", label: "Poussin (stage)" },
];

const PHASES = [
  { id: "0", label: "Toutes phases" },
  { id: "1", label: "Poules" },
  { id: "2", label: "Barrage" },
  { id: "12", label: "Finale" },
];

export default function ResultsScreen() {
  const segment = useSegments()[0] ?? "(tournaments)";

  const [competitionId, setCompetitionId] = useState<string | undefined>(undefined);
  const [specialty, setSpecialty] = useState<string>("0");
  const [category, setCategory] = useState<string>("0");
  const [phase, setPhase] = useState<string>("0");
  const [ville, setVille] = useState<string>("0");
  const [club, setClub] = useState<string>("0");

  const { data: tournaments } = useTournaments();
  const { data: matches, isLoading, error, refetch } = useMatches({
    competitionId,
    specialty: specialty === "0" ? undefined : specialty,
    category: category === "0" ? undefined : category,
    phase: phase === "0" ? undefined : phase,
    ville: ville === "0" ? undefined : ville,
    club: club === "0" ? undefined : club,
  });

  if (isLoading && !matches) return <LoadingState message="Fetching results..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <FilterSection
              label="Competition"
              value={competitionId}
              options={tournaments?.map((t) => ({ id: t.id, label: t.name })) ?? []}
              onSelect={setCompetitionId}
            />
            <FilterSection
              label="Specialty"
              value={specialty}
              options={SPECIALTIES}
              onSelect={setSpecialty}
            />
            <FilterSection
              label="Category"
              value={category}
              options={CATEGORIES}
              onSelect={setCategory}
            />
            <FilterSection
              label="Phase"
              value={phase}
              options={PHASES}
              onSelect={setPhase}
            />
            <FilterSection
              label="Ville"
              value={ville}
              options={[{ id: "0", label: "Toutes" }]}
              onSelect={setVille}
            />
            <FilterSection
              label="Club"
              value={club}
              options={[{ id: "0", label: "Tous" }]}
              onSelect={setClub}
            />
          </View>
        </ScrollView>
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
            <Text style={{ fontSize: 16, color: "#9CA3AF" }}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

function FilterSection({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string | undefined;
  options: { id: string; label: string }[];
  onSelect: (val: string) => void;
}) {
  const selectedLabel = options.find((o) => o.id === value)?.label ?? "All";

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: "#6B7280", marginLeft: 4 }}>
        {label.toUpperCase()}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              style={{
                backgroundColor: value === opt.id ? "#1D4ED8" : "#F3F4F6",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: value === opt.id ? "#fff" : "#374151",
                }}
              >
                {opt.label.length > 20 ? opt.label.slice(0, 20) + "..." : opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
