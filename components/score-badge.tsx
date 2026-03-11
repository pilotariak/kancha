import type { Score } from "@/types/match";
import { Text, View } from "react-native";

interface ScoreBadgeProps {
  score: Score;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { fontSize: 14, gap: 6 },
  md: { fontSize: 20, gap: 8 },
  lg: { fontSize: 28, gap: 12 },
};

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const { fontSize, gap } = SIZES[size];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap }}>
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "800",
          fontVariant: ["tabular-nums"],
          minWidth: fontSize * 1.2,
          textAlign: "center",
        }}
      >
        {score.home}
      </Text>
      <Text style={{ fontSize: fontSize * 0.7, color: "#9CA3AF", fontWeight: "300" }}>
        –
      </Text>
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "800",
          fontVariant: ["tabular-nums"],
          minWidth: fontSize * 1.2,
          textAlign: "center",
        }}
      >
        {score.away}
      </Text>
    </View>
  );
}
