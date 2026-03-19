import { Colors } from "@/constants/theme";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        padding: 24,
        backgroundColor: Colors.ink,
      }}
    >
      <ActivityIndicator size="large" color={Colors.verde} />
      <Text style={{ color: Colors.textMuted, fontSize: 14 }}>{message}</Text>
    </View>
  );
}
