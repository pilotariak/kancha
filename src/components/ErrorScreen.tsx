import type { ErrorBoundaryProps } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

/**
 * Themed fallback rendered by Expo Router when a route subtree throws during
 * render. Re-exported as `ErrorBoundary` from `src/app/_layout.tsx` so it
 * catches errors across the whole app instead of showing a blank screen.
 *
 * Kept dependency-light on purpose: it must render even when providers higher
 * in the tree (SafeAreaProvider, navigation) failed to mount. `useTheme` and
 * `useTranslation` rely only on module-level state, so they are safe here.
 */
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} accessibilityRole="header">
          {t("error.title")}
        </Text>
        <Text style={styles.subtitle}>{t("error.subtitle")}</Text>

        {__DEV__ && error?.message
          ? (
            <View style={styles.detailBox}>
              <Text style={styles.detailText} selectable>{error.message}</Text>
            </View>
          )
          : null}

        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryBtnPressed]}
          onPress={retry}
          accessibilityRole="button"
          accessibilityLabel={t("error.retry")}
        >
          <RotateCcw color="#FFFFFF" size={18} />
          <Text style={styles.retryLabel}>{t("error.retry")}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.cream,
      paddingTop: Platform.OS === "android" ? 32 : 64,
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 10,
    },
    title: {
      color: c.ink,
      fontSize: 26,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      color: c.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 300,
    },
    detailBox: {
      marginTop: 12,
      width: "100%",
      borderRadius: 12,
      backgroundColor: c.redSoft,
      padding: 14,
    },
    detailText: {
      color: c.redDark,
      fontSize: 13,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    retryBtn: {
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      backgroundColor: c.red,
      paddingHorizontal: 22,
      paddingVertical: 14,
    },
    retryBtnPressed: { opacity: 0.8 },
    retryLabel: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
  });
