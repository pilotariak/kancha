import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ScoreBadge } from "@/components/score-badge";
import { Colors } from "@/constants/theme";
import { useMatch } from "@/hooks/use-matches";
import type { Player } from "@/types/competition";
import { formatDateMatch } from "@/utils/date";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

function PlayerChip({ player, align = "left" }: { player: Player; align?: "left" | "right" }) {
  return (
    <View
      style={{
        flexDirection: align === "right" ? "row-reverse" : "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Jersey number bubble */}
      {player.number && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.verdeGlow,
            borderWidth: 1,
            borderColor: "rgba(26, 102, 64, 0.3)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.verdeBright }}>
            {player.number}
          </Text>
        </View>
      )}
      <Text
        selectable
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: Colors.textSecondary,
          textAlign: align,
        }}
      >
        {player.name}
      </Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: Colors.cardBackground,
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        overflow: "hidden",
      }}
    >
      {/* Section title bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: Colors.divider,
        }}
      >
        <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: Colors.verde }} />
        <Text
          style={{ fontSize: 13, fontWeight: "700", color: Colors.textPrimary, letterSpacing: 0.3 }}
        >
          {title.toUpperCase()}
        </Text>
      </View>

      <View style={{ padding: 16, gap: 10 }}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontSize: 13, color: Colors.textMuted }}>{label}</Text>
      <Text selectable style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}>
        {value}
      </Text>
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

  const winnerA = hasScore && (result.scoreA as number) > (result.scoreB as number);
  const winnerB = hasScore && (result.scoreB as number) > (result.scoreA as number);

  return (
    <>
      <Stack.Screen
        options={{ title: `${result.clubA.name} vs ${result.clubB.name}` }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: Colors.ink }}
        contentContainerStyle={{ padding: 16, gap: 14 }}
      >
        {/* ── Hero score card ── */}
        <View
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            padding: 24,
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* Phase pill */}
          {result.phase && (
            <View
              style={{
                backgroundColor: Colors.phaseBg,
                borderWidth: 1,
                borderColor: Colors.phaseBorder,
                borderRadius: 8,
                borderCurve: "continuous",
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 11, color: Colors.rojo, fontWeight: "700", letterSpacing: 1 }}
              >
                {result.phase.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Teams + score row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: 12,
            }}
          >
            {/* Club A */}
            <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
              {winnerA && (
                <View
                  style={{
                    backgroundColor: Colors.verdeGlow,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: Colors.verdeBright,
                      fontWeight: "700",
                      letterSpacing: 1,
                    }}
                  >
                    WINNER
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: winnerA ? "800" : "600",
                  textAlign: "center",
                  color: winnerA ? Colors.textPrimary : Colors.textSecondary,
                  lineHeight: 22,
                }}
                numberOfLines={3}
              >
                {result.clubA.name}
              </Text>
            </View>

            {/* Score or VS */}
            {hasScore
              ? (
                <ScoreBadge
                  scoreA={result.scoreA as number}
                  scoreB={result.scoreB as number}
                  size="lg"
                />
              )
              : (
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: Colors.chipInactive,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, color: Colors.textMuted, fontWeight: "600" }}>
                    vs
                  </Text>
                </View>
              )}

            {/* Club B */}
            <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
              {winnerB && (
                <View
                  style={{
                    backgroundColor: Colors.verdeGlow,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: Colors.verdeBright,
                      fontWeight: "700",
                      letterSpacing: 1,
                    }}
                  >
                    WINNER
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: winnerB ? "800" : "600",
                  textAlign: "center",
                  color: winnerB ? Colors.textPrimary : Colors.textSecondary,
                  lineHeight: 22,
                }}
                numberOfLines={3}
              >
                {result.clubB.name}
              </Text>
            </View>
          </View>

          {/* Specialty tag */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: Colors.verdeGlow,
              borderRadius: 8,
              borderCurve: "continuous",
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: Colors.verdeBright, fontWeight: "600" }}>
              {result.specialty.name}
            </Text>
            {result.category && (
              <>
                <Text style={{ fontSize: 11, color: Colors.textMuted }}>·</Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted }}>{result.category}</Text>
              </>
            )}
          </View>
        </View>

        {/* ── Match details ── */}
        <SectionCard title="Details">
          {result.dateMatch && (
            <InfoRow
              label="Date"
              value={formatDateMatch(result.dateMatch, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              }) ?? result.dateMatch}
            />
          )}
          <InfoRow label="Competition" value={result.competition.name} />
        </SectionCard>

        {/* ── Lineups — side by side ── */}
        {(result.clubALineup || result.clubBLineup) && (
          <SectionCard title="Lineups">
            {/* Column headers */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingBottom: 6,
                borderBottomWidth: 1,
                borderBottomColor: Colors.divider,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: Colors.verdeBright, flex: 1 }}
                numberOfLines={1}
              >
                {result.clubA.name}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.verdeBright,
                  flex: 1,
                  textAlign: "right",
                }}
                numberOfLines={1}
              >
                {result.clubB.name}
              </Text>
            </View>

            {/* Player rows side-by-side */}
            {[
              { playerA: result.clubALineup?.player1, playerB: result.clubBLineup?.player1 },
              { playerA: result.clubALineup?.player2, playerB: result.clubBLineup?.player2 },
            ].map(({ playerA, playerB }, idx) => {
              if (!playerA && !playerB) return null;
              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    {playerA && <PlayerChip player={playerA} align="left" />}
                  </View>
                  <View style={{ width: 1, height: 24, backgroundColor: Colors.divider }} />
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    {playerB && <PlayerChip player={playerB} align="right" />}
                  </View>
                </View>
              );
            })}
          </SectionCard>
        )}
      </ScrollView>
    </>
  );
}
