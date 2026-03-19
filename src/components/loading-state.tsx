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
        gap: 14,
        padding: 24,
        backgroundColor: Colors.ink,
      }}
    >
      <ActivityIndicator size="large" color={Colors.verdeBright} />
      <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: "500" }}>
        {message}
      </Text>
    </View>
  );
}
