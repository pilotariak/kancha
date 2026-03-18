import { Colors } from "@/constants/theme";
import type { Result } from "@/types/competition";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ScoreBadge } from "./score-badge";

interface MatchCardProps {
  match: Result;
  segment: string;
}

function lineupNames(lineup: Result["clubALineup"]): string | null {
  if (!lineup) return null;
  const names = [lineup.player1?.name, lineup.player2?.name].filter(Boolean);
  return names.length > 0 ? names.join(" / ") : null;
}

export function MatchCard({ match, segment }: MatchCardProps) {
  const hasScore = match.scoreA !== null && match.scoreA !== undefined
    && match.scoreB !== null && match.scoreB !== undefined;

  const lineupA = lineupNames(match.clubALineup);
  const lineupB = lineupNames(match.clubBLineup);

  return (
    <Link href={`/${segment}/${match.id}` as Href} asChild>
      <Pressable
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.selectionAsync();
          }
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <View
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            padding: 16,
            gap: 10,
          }}
        >
          {/* Phase + date row */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            {match.phase
              ? (
                <Text
                  style={{
                    fontSize: 10,
                    color: Colors.rojo,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                  }}
                >
                  {match.phase.toUpperCase()}
                </Text>
              )
              : <View />}
            {match.dateMatch && (
              <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                {new Date(match.dateMatch).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            )}
          </View>

          {/* Score row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}
                numberOfLines={1}
              >
                {match.clubA.name}
              </Text>
              {lineupA && (
                <Text style={{ fontSize: 11, color: Colors.textMuted }} numberOfLines={1}>
                  {lineupA}
                </Text>
              )}
            </View>

            {hasScore
              ? (
                <ScoreBadge
                  scoreA={match.scoreA as number}
                  scoreB={match.scoreB as number}
                  size="sm"
                />
              )
              : (
                <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: "500" }}>
                  vs
                </Text>
              )}

            <View style={{ flex: 1, gap: 2, alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  textAlign: "right",
                  color: Colors.textPrimary,
                }}
                numberOfLines={1}
              >
                {match.clubB.name}
              </Text>
              {lineupB && (
                <Text
                  style={{ fontSize: 11, color: Colors.textMuted, textAlign: "right" }}
                  numberOfLines={1}
                >
                  {lineupB}
                </Text>
              )}
            </View>
          </View>

          {/* Specialty + category */}
          <Text style={{ fontSize: 11, color: Colors.textMuted, letterSpacing: 0.3 }}>
            {match.specialty.name}
            {match.category ? ` · ${match.category}` : ""}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
