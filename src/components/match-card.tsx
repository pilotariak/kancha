import { Colors } from "@/constants/theme";
import type { Result } from "@/types/competition";
import { formatDateMatch } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ScoreBadge } from "./score-badge";

interface MatchCardProps {
  match: Result;
  /** When true, the phase pill is suppressed (already shown as a section header) */
  hidePhase?: boolean;
}

function lineupNames(lineup: Result["clubALineup"]): string | null {
  if (!lineup) return null;
  const names = [lineup.player1?.name, lineup.player2?.name].filter(Boolean);
  return names.length > 0 ? names.join(" · ") : null;
}

export function MatchCard({ match, hidePhase = false }: MatchCardProps) {
  const hasScore = match.scoreA !== null && match.scoreA !== undefined
    && match.scoreB !== null && match.scoreB !== undefined;

  const winnerA = hasScore && (match.scoreA as number) > (match.scoreB as number);
  const winnerB = hasScore && (match.scoreB as number) > (match.scoreA as number);

  const lineupA = lineupNames(match.clubALineup);
  const lineupB = lineupNames(match.clubBLineup);

  return (
    <Link href={`/(tournaments)/result/${match.id}` as Href} asChild>
      <Pressable
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.selectionAsync();
          }
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
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
          {/* Top meta bar: phase (if not in section header) + date */}
          {(!hidePhase && match.phase) || match.dateMatch
            ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingTop: 10,
                  paddingBottom: 0,
                }}
              >
                {!hidePhase && match.phase
                  ? (
                    <View
                      style={{
                        backgroundColor: Colors.phaseBg,
                        borderWidth: 1,
                        borderColor: Colors.phaseBorder,
                        borderRadius: 6,
                        borderCurve: "continuous",
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                      }}
                    >
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
                    </View>
                  )
                  : <View />}

                {match.dateMatch && (
                  <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                    {formatDateMatch(match.dateMatch, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                )}
              </View>
            )
            : null}

          {/* Main match row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 14,
              gap: 10,
            }}
          >
            {/* Club A */}
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                {winnerA && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.winnerDot,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: winnerA ? "800" : "600",
                    color: winnerA ? Colors.textPrimary : Colors.textSecondary,
                    flexShrink: 1,
                  }}
                  numberOfLines={2}
                >
                  {match.clubA.name}
                </Text>
              </View>
              {lineupA && (
                <Text
                  style={{ fontSize: 11, color: Colors.textMuted, marginLeft: winnerA ? 11 : 0 }}
                  numberOfLines={1}
                >
                  {lineupA}
                </Text>
              )}
            </View>

            {/* Score / VS */}
            <View style={{ alignItems: "center" }}>
              {hasScore
                ? (
                  <ScoreBadge
                    scoreA={match.scoreA as number}
                    scoreB={match.scoreB as number}
                    size="sm"
                  />
                )
                : (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: Colors.chipInactive,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: Colors.textMuted, fontWeight: "600" }}>
                      vs
                    </Text>
                  </View>
                )}
            </View>

            {/* Club B */}
            <View style={{ flex: 1, gap: 3, alignItems: "flex-end" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  justifyContent: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: winnerB ? "800" : "600",
                    textAlign: "right",
                    color: winnerB ? Colors.textPrimary : Colors.textSecondary,
                    flexShrink: 1,
                  }}
                  numberOfLines={2}
                >
                  {match.clubB.name}
                </Text>
                {winnerB && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.winnerDot,
                      flexShrink: 0,
                    }}
                  />
                )}
              </View>
              {lineupB && (
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.textMuted,
                    textAlign: "right",
                    marginRight: winnerB ? 11 : 0,
                  }}
                  numberOfLines={1}
                >
                  {lineupB}
                </Text>
              )}
            </View>
          </View>

          {/* Footer: specialty + category */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingBottom: 10,
              paddingTop: 0,
            }}
          >
            <View
              style={{
                width: 3,
                height: 12,
                borderRadius: 2,
                backgroundColor: Colors.verde,
              }}
            />
            <Text style={{ fontSize: 11, color: Colors.verdeBright, fontWeight: "600" }}>
              {match.specialty.name}
            </Text>
            {match.category && (
              <>
                <Text style={{ fontSize: 10, color: Colors.textMuted }}>·</Text>
                <Text style={{ fontSize: 11, color: Colors.textMuted }}>{match.category}</Text>
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
