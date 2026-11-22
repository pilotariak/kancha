import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useThemedStyles } from "@/hooks/use-theme";

/** Left inset of the line between rows: the rows' side padding. */
export const ROW_INSET = 20;

interface ListGroupProps {
  title: string;
  children: React.ReactNode;
  testID?: string;
}

/**
 * A titled group of rows in one card, with a line between rows, like an iOS inset grouped
 * list. The card clips its rows, so a row's pressed or selected fill follows its corners.
 */
export function ListGroup({ title, children, testID }: ListGroupProps) {
  const styles = useThemedStyles(makeStyles);
  const rows = React.Children.toArray(children);
  return (
    <View style={styles.group} testID={testID}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <View style={styles.card}>
        {rows.map((row, index) => (
          <React.Fragment key={React.isValidElement(row) ? row.key : index}>
            {index > 0 && <ListSeparator />}
            {row}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

/** The line between two rows, `inset` from the card's left edge. */
export function ListSeparator({ inset = ROW_INSET }: { inset?: number }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.separator, { marginLeft: inset }]} />;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    group: { gap: 8 },
    // placeholder, not muted: muted on cream is 3.9:1 in the light theme.
    title: {
      color: c.placeholder,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    card: {
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    separator: { height: 1, backgroundColor: c.line },
  });
