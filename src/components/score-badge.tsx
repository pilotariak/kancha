import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";

interface ScoreBadgeProps {
  scoreA: number;
  scoreB: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { fontSize: 14, gap: 6 },
  md: { fontSize: 20, gap: 8 },
  lg: { fontSize: 28, gap: 12 },
};

export function ScoreBadge({ scoreA, scoreB, size = "md" }: ScoreBadgeProps) {
  const { fontSize, gap } = SIZES[size];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap }}>
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
          fontFamily: "Courier New",
          minWidth: fontSize * 1.2,
          textAlign: "center",
          color: Colors.oro,
        }}
      >
        {scoreA}
      </Text>
      <Text style={{ fontSize: fontSize * 0.7, color: Colors.rojo, fontWeight: "700" }}>
        —
      </Text>
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
          fontFamily: "Courier New",
          minWidth: fontSize * 1.2,
          textAlign: "center",
          color: Colors.oro,
        }}
      >
        {scoreB}
      </Text>
    </View>
  );
}
