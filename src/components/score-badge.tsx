import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";

interface ScoreBadgeProps {
  scoreA: number;
  scoreB: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { fontSize: 14, gap: 4, px: 10, py: 5 },
  md: { fontSize: 20, gap: 6, px: 14, py: 8 },
  lg: { fontSize: 28, gap: 10, px: 18, py: 12 },
};

export function ScoreBadge({ scoreA, scoreB, size = "md" }: ScoreBadgeProps) {
  const { fontSize, gap, px, py } = SIZES[size];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap,
        backgroundColor: Colors.scoreBg,
        borderWidth: 1,
        borderColor: Colors.scoreBorder,
        borderRadius: 10,
        borderCurve: "continuous",
        paddingHorizontal: px,
        paddingVertical: py,
      }}
    >
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "800",
          fontVariant: ["tabular-nums"],
          fontFamily: "Courier New",
          minWidth: fontSize * 1.1,
          textAlign: "center",
          color: Colors.oro,
        }}
      >
        {scoreA}
      </Text>
      <Text style={{ fontSize: fontSize * 0.65, color: Colors.textMuted, fontWeight: "600" }}>
        :
      </Text>
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "800",
          fontVariant: ["tabular-nums"],
          fontFamily: "Courier New",
          minWidth: fontSize * 1.1,
          textAlign: "center",
          color: Colors.oro,
        }}
      >
        {scoreB}
      </Text>
    </View>
  );
}
