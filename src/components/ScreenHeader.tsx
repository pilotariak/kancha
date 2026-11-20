import { router } from "expo-router";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { ArrowLeft } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { type InteractionState, showsFocusRing } from "@/hooks/use-interaction-styles";
import { useThemedStyles } from "@/hooks/use-theme";

/** The height of the collapsed bar. */
export const BAR_HEIGHT = 52;

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
  /**
   * The 52px bar a compact band collapses to while the screen scrolls: the back arrow and the
   * title on one line. Eyebrow, subtitle, trailing and column do not apply.
   */
  collapsed?: boolean;
  /** Out of reach of touch, keyboard and screen readers: a collapsed bar not yet shown. */
  inert?: boolean;
  /**
   * Collapsed only: the opacity of the back arrow and the title, for a bar that fades in its
   * fill first, so its title never shows over the band's.
   */
  contentOpacity?: Animated.AnimatedInterpolation<number> | number;
  /** The screen's text column (`useTextColumn()`): the band's content keeps to it. */
  column?: ViewStyle;
}

/**
 * The screen header: a solid redFill band, sized by its content, with white
 * text. Everything below it sits on cream. Place it first in the scroll view,
 * outside the 20px gutter, so the band spans the full width. Give the screen's
 * top-edge SafeAreaView a redFill background and the scroll view a cream one:
 * the band then continues behind the light status bar and scrolls away under it.
 * On a text screen wider than a phone, the band stays full width and its content keeps to
 * the screen's text column. A compact band can also render `collapsed`, as the bar a screen pins
 * at the top once the band has scrolled away (the results screen).
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
  collapsed = false,
  inert = false,
  contentOpacity = 1,
  column,
}: ScreenHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  if (collapsed) {
    return (
      <View style={[styles.bar, inert && styles.inert]} aria-hidden={inert}>
        <Animated.View style={[styles.barContent, { opacity: contentOpacity }]}>
          {backLabel
            ? (
              <Pressable
                style={(state: InteractionState) => [
                  styles.barBack,
                  (state.hovered || state.pressed) && styles.barBackActive,
                  showsFocusRing(state) && styles.barBackFocusRing,
                ]}
                onPress={onBack ?? (() => router.back())}
                hitSlop={4}
                tabIndex={inert ? -1 : undefined}
                accessibilityRole="button"
                accessibilityLabel={backLabel}
              >
                <ArrowLeft color="#FFFFFF" size={20} />
              </Pressable>
            )
            : null}
          {loading
            ? <ActivityIndicator color="#FFFFFF" accessibilityLabel={t("common.loading")} />
            : <Text style={styles.barTitle} numberOfLines={1}>{title}</Text>}
        </Animated.View>
      </View>
    );
  }

  const content = (
    <>
      {backLabel
        ? (
          <Pressable
            style={(state: InteractionState) => [
              styles.back,
              showsFocusRing(state) && styles.backFocusRing,
            ]}
            onPress={onBack ?? (() => router.back())}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
          >
            {(state: InteractionState) => (
              <>
                <ArrowLeft color="#FFFFFF" size={20} />
                <Text style={[styles.backLabel, state.hovered && styles.backLabelHovered]}>
                  {backLabel}
                </Text>
              </>
            )}
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
    </>
  );

  return (
    <View style={[styles.band, compact && styles.bandCompact, column && styles.bandFullWidth]}>
      {column
        ? <View style={[styles.inner, compact && styles.innerCompact, column]}>{content}</View>
        : content}
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
    // With a text column: the gutter moves to the inner column.
    bandFullWidth: { paddingHorizontal: 0 },
    inner: { paddingHorizontal: 20, gap: 16 },
    innerCompact: { gap: 12 },
    back: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
    },
    // Web: a white ring, as the red one would not show on the band.
    backFocusRing: {
      borderRadius: 8,
      outlineColor: "#FFFFFF",
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 4,
    },
    backLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
    backLabelHovered: { textDecorationLine: "underline" },
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

    // Collapsed: the band's fill and corners, so the bar fades in over the band seamlessly.
    bar: {
      justifyContent: "center",
      height: BAR_HEIGHT,
      paddingLeft: 12,
      paddingRight: 20,
      backgroundColor: c.redFill,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    barContent: { flexDirection: "row", alignItems: "center", gap: 8 },
    inert: { pointerEvents: "none" },
    // 36px round, centered on the band's back arrow (20px from the edge); hitSlop makes it 44.
    barBack: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
    },
    barBackActive: { backgroundColor: c.redDark },
    barBackFocusRing: {
      outlineColor: "#FFFFFF",
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 2,
    },
    barTitle: { flex: 1, color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  });
