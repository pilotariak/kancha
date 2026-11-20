import React, { isValidElement, type ReactNode } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { GRID_GAP } from "@/features/layout/breakpoints";

interface CardGridProps {
  /** Cards per row, from `useWebLayout().columns`. */
  columns: number;
  /** The list's own style: in one column, the grid is that list, as on a phone. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Cards side by side, `columns` per row. Each card sits in a `flex: 1` cell without padding,
 * and empty cells fill a short last row, so every card keeps the same width. In one column
 * the cards render as before: in a view with `style`, or on their own without one.
 */
export function CardGrid({ columns, style, children }: CardGridProps) {
  if (columns <= 1) return style ? <View style={style}>{children}</View> : <>{children}</>;

  const items = React.Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

  return (
    <View style={[style, styles.grid]}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((item, c) => (
            <View key={isValidElement(item) && item.key != null ? item.key : c} style={styles.cell}>
              {item}
            </View>
          ))}
          {Array.from(
            { length: columns - row.length },
            (_, e) => <View key={`empty-${e}`} style={styles.cell} />,
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: GRID_GAP },
  row: { flexDirection: "row", gap: GRID_GAP },
  cell: { flex: 1 },
});
