import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { KanchaColors } from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This court does not exist.</Text>
        <Text style={styles.subtitle}>
          The page you requested could not be found inside Kancha.
        </Text>
        <Link href="/" style={styles.link} testID="not-found-link">
          <Text style={styles.linkText}>Return to home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: KanchaColors.cream,
  },
  title: {
    color: KanchaColors.ink,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: KanchaColors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
  link: {
    marginTop: 20,
    borderRadius: 999,
    backgroundColor: KanchaColors.red,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  linkText: { color: KanchaColors.white, fontSize: 14, fontWeight: "800" },
});
