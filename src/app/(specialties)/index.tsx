import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Colors } from "@/constants/theme";
import { useSpecialties } from "@/hooks/use-specialties";
import type { Specialty } from "@/types/competition";
import { FlatList, Text, View } from "react-native";

function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  return (
    <View
      style={{
        backgroundColor: Colors.cardBackground,
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.verdeGlow,
          borderWidth: 1,
          borderColor: "rgba(26, 102, 64, 0.35)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20 }}>🎾</Text>
      </View>
      <Text
        style={{ fontSize: 15, fontWeight: "600", flex: 1, color: Colors.textPrimary }}
        numberOfLines={2}
      >
        {specialty.name}
      </Text>
    </View>
  );
}

export default function SpecialtiesScreen() {
  const { data: specialties, isLoading, error, refetch } = useSpecialties();

  if (isLoading) return <LoadingState message="Loading specialties..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <FlatList
      data={specialties}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: Colors.ink }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => <SpecialtyCard specialty={item} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 48, gap: 8 }}>
          <Text style={{ fontSize: 40 }}>🎾</Text>
          <Text style={{ fontSize: 16, color: Colors.textMuted }}>No specialties found</Text>
        </View>
      }
    />
  );
}
