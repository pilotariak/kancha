import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";

/** Visual rank for common phase names — higher = later/more important round */
const PHASE_RANK: Record<string, number> = {
  final: 5,
  finale: 5,
  "demi-finale": 4,
  "semi-final": 4,
  semifinal: 4,
  "quart-de-finale": 3,
  "quarter-final": 3,
  quarterfinal: 3,
  huitième: 2,
  "round of 16": 2,
  poule: 1,
  group: 1,
  pool: 1,
};

function phaseAccentColor(phase: string): string {
  const key = phase.toLowerCase().trim();
  const rank = Object.entries(PHASE_RANK).find(([k]) => key.includes(k))?.[1] ?? 0;
  if (rank >= 5) return Colors.oro; // Final → gold
  if (rank >= 4) return Colors.verdeBright; // Semi → bright green
  if (rank >= 3) return Colors.verde; // Quarter → green
  return Colors.textSecondary; // Groups / pools → muted
}

interface PhaseHeaderProps {
  phase: string;
  matchCount: number;
}

export function PhaseHeader({ phase, matchCount }: PhaseHeaderProps) {
  const accent = phaseAccentColor(phase);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 4,
        paddingTop: 20,
        paddingBottom: 8,
      }}
    >
      {/* Colored dot */}
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: accent,
        }}
      />

      {/* Phase name */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: accent,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          flex: 1,
        }}
      >
        {phase}
      </Text>

      {/* Match count badge */}
      <View
        style={{
          backgroundColor: Colors.chipInactive,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
      >
        <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: "500" }}>
          {matchCount} match{matchCount !== 1 ? "es" : ""}
        </Text>
      </View>
    </View>
  );
}
