import type { Href } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CardLink } from "@/components/CardLink";
import { ChevronRight } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

interface FeaturedCardProps {
  eyebrow: string;
  title: string;
  /** The action, shown at the bottom with a chevron: "Voir les résultats". */
  footer: string;
  /** The screen the card opens: a path, for the iOS preview and its Share and Copy link. */
  href: Extract<Href, string>;
  testID?: string;
}

/**
 * The one red card of a screen, for its main content (the current season). It sits on
 * cream, 22px or more below the red header band, so the two read as separate blocks.
 */
export function FeaturedCard({ eyebrow, title, footer, href, testID }: FeaturedCardProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <CardLink
      style={styles.card}
      href={href}
      accessibilityRole="button"
      accessibilityLabel={`${eyebrow}, ${title}`}
      accessibilityHint={footer}
      testID={testID}
    >
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{footer}</Text>
        <ChevronRight color="#FFFFFF" size={18} />
      </View>
    </CardLink>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.redFill,
      borderRadius: 24,
      padding: 22,
      gap: 8,
    },
    eyebrow: {
      color: c.onRedSoft,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    title: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", lineHeight: 31 },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    footerLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  });
