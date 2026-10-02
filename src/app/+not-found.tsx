import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

export default function NotFoundScreen() {
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">This court does not exist.</Text>
        <Text style={styles.subtitle}>
          The page you requested could not be found inside Kancha.
        </Text>
        <Link
          href="/"
          style={styles.link}
          testID="not-found-link"
          accessibilityRole="button"
          accessibilityLabel="Return to home"
        >
          <Text style={styles.linkText}>Return to home</Text>
        </Link>
      </View>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: c.cream,
    },
    title: {
      color: c.ink,
      fontSize: 24,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      color: c.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 8,
      maxWidth: 280,
    },
    link: {
      marginTop: 20,
      borderRadius: 999,
      backgroundColor: c.red,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    linkText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  });
