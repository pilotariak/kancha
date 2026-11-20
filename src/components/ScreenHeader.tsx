import { router } from "expo-router";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ArrowLeft } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Shows a back link with this label. */
  backLabel?: string;
  /** Defaults to `router.back()`. */
  onBack?: () => void;
  /** Replaces the title and subtitle with a spinner. */
  loading?: boolean;
  /** Rendered to the right of the text, e.g. a logo or an action button. */
  trailing?: ReactNode;
  /** A 28px title and tighter padding, for screens with filters under the band. */
  compact?: boolean;
}

/**
 * The screen header: a solid redFill band, sized by its content, with white
 * text. Everything below it sits on cream. Place it first in the scroll view,
 * outside the 20px gutter, so the band spans the full width. Give the screen's
 * top-edge SafeAreaView a redFill background and the scroll view a cream one:
 * the band then continues behind the light status bar and scrolls away under it.
 */
export function ScreenHeader({
  title,
  eyebrow,
  subtitle,
  backLabel,
  onBack,
  loading = false,
  trailing,
  compact = false,
}: ScreenHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.band, compact && styles.bandCompact]}>
      {backLabel
        ? (
          <Pressable
            style={styles.back}
            onPress={onBack ?? (() => router.back())}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
            <Text style={styles.backLabel}>{backLabel}</Text>
          </Pressable>
        )
        : null}
      <View style={styles.row}>
        <View style={styles.text}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {loading
            ? (
              <ActivityIndicator
                color="#FFFFFF"
                style={styles.spinner}
                accessibilityLabel={t("common.loading")}
              />
            )
            : (
              <>
                <Text
                  style={[styles.title, compact && styles.titleCompact]}
                  accessibilityRole="header"
                >
                  {title}
                </Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </>
            )}
        </View>
        {trailing}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    band: {
      backgroundColor: c.redFill,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 16,
    },
    bandCompact: { paddingBottom: 16, gap: 12 },
    back: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
    },
    backLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
    row: { flexDirection: "row", alignItems: "center", gap: 16 },
    text: { flex: 1, gap: 6 },
    eyebrow: {
      color: c.onRedSoft,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    title: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", lineHeight: 37 },
    titleCompact: { fontSize: 28, lineHeight: 31 },
    subtitle: { color: c.onRedStrong, fontSize: 14, lineHeight: 20 },
    spinner: { alignSelf: "flex-start", paddingVertical: 8 },
  });
