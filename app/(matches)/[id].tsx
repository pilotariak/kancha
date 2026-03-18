import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ScoreBadge } from "@/components/score-badge";
import { Colors } from "@/constants/theme";
import { useMatch } from "@/hooks/use-matches";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

function PlayerRow({
  label,
  name,
  number,
}: { label: string; name?: string; number?: string | null }) {
  if (!name) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 13, color: Colors.textMuted }}>{label}</Text>
      <Text selectable style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}>
        {number ? `#${number} ` : ""}
        {name}
      </Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: Colors.cardBackground,
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: 16,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: result, isLoading, error, refetch } = useMatch(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!result) return null;

  const hasScore = result.scoreA !== null && result.scoreA !== undefined
    && result.scoreB !== null && result.scoreB !== undefined;

  return (
    <>
      <Stack.Screen
        options={{
          title: `${result.clubA.name} vs ${result.clubB.name}`,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: Colors.ink }}
      >
        <View style={{ padding: 16, gap: 16 }}>
          {/* Score card */}
          <View
            style={{
              backgroundColor: Colors.cardBackground,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: Colors.cardBorder,
              padding: 24,
              alignItems: "center",
              gap: 16,
            }}
          >
            {result.phase && (
              <Text
                style={{
                  fontSize: 10,
                  color: Colors.rojo,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {result.phase.toUpperCase()}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                  color: Colors.textPrimary,
                }}
                numberOfLines={2}
              >
                {result.clubA.name}
              </Text>

              {hasScore
                ? (
                  <ScoreBadge
                    scoreA={result.scoreA as number}
                    scoreB={result.scoreB as number}
                    size="lg"
                  />
                )
                : <Text style={{ fontSize: 18, color: Colors.textMuted }}>vs</Text>}

              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                  color: Colors.textPrimary,
                }}
                numberOfLines={2}
              >
                {result.clubB.name}
              </Text>
            </View>

            <Text style={{ fontSize: 13, color: Colors.textMuted }}>
              {result.specialty.name}
              {result.category ? ` · ${result.category}` : ""}
            </Text>
          </View>

          {/* Match details */}
          <SectionCard>
            <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>
              Details
            </Text>

            {result.dateMatch && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: Colors.textMuted }}>Date</Text>
                <Text
                  selectable
                  style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}
                >
                  {new Date(result.dateMatch).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: Colors.textMuted }}>Competition</Text>
              <Text
                selectable
                style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}
              >
                {result.competition.name} {result.competition.year}
              </Text>
            </View>
          </SectionCard>

          {/* Lineups */}
          {(result.clubALineup || result.clubBLineup) && (
            <SectionCard>
              <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>
                Lineups
              </Text>

              {result.clubALineup && (
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: Colors.textMuted,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                    }}
                  >
                    {result.clubA.name.toUpperCase()}
                  </Text>
                  <PlayerRow
                    label="Player 1"
                    name={result.clubALineup.player1?.name}
                    number={result.clubALineup.player1?.number}
                  />
                  <PlayerRow
                    label="Player 2"
                    name={result.clubALineup.player2?.name}
                    number={result.clubALineup.player2?.number}
                  />
                </View>
              )}

              {result.clubBLineup && (
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: Colors.textMuted,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                    }}
                  >
                    {result.clubB.name.toUpperCase()}
                  </Text>
                  <PlayerRow
                    label="Player 1"
                    name={result.clubBLineup.player1?.name}
                    number={result.clubBLineup.player1?.number}
                  />
                  <PlayerRow
                    label="Player 2"
                    name={result.clubBLineup.player2?.name}
                    number={result.clubBLineup.player2?.number}
                  />
                </View>
              )}
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </>
  );
}
