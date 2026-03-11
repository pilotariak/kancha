import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 }}>
      <ActivityIndicator size="large" />
      <Text style={{ color: "#9CA3AF", fontSize: 14 }}>{message}</Text>
    </View>
  );
}
