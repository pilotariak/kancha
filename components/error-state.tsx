import { Pressable, Text, View } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 }}>
      <Text style={{ fontSize: 40 }}>⚠️</Text>
      <Text selectable style={{ color: "#EF4444", fontSize: 15, textAlign: "center" }}>
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            backgroundColor: "#3B82F6",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            borderCurve: "continuous",
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}
