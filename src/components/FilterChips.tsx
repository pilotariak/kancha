import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface FilterChipsProps {
  options: readonly { id: string; name: string }[];
  value?: string;
  onChange: (id: string) => void;
  /** Names the group for screen readers. */
  accessibilityLabel: string;
  /** Wraps the chips onto several lines, inside the gutter, instead of a scrolling row. */
  wrap?: boolean;
  testID?: string;
}

const GUTTER = 20;

/**
 * One choice among short names, as a row of chips. The row bleeds over the
 * screen gutter and scrolls sideways; a cream fade on the right edge shows
 * that more chips follow. With `wrap`, the chips flow onto several lines.
 */
export function FilterChips(props: FilterChipsProps) {
  // A new set of chips mounts a new row: it resets the scroll state, and on web
  // onLayout only fires on a size change, so a chip that only moved would not
  // scroll into view.
  return <ChipRow key={props.options.map((o) => o.id).join(",")} {...props} />;
}

function ChipRow({ options, value, onChange, accessibilityLabel, wrap, testID }: FilterChipsProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const viewportWidth = useWebLayout().contentWidth;
  const scrollRef = useRef<ScrollView>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const hasMore = contentWidth - frameWidth - offset > 1;

  const chips = options.map((option) => {
    const selected = option.id === value;
    return (
      <Pressable
        key={option.id}
        style={(state: InteractionState) => [
          styles.chip,
          selected
            ? styles.chipSelected
            : [state.pressed && styles.chipPressed, state.hovered && interaction.hoverBorder],
          showsFocusRing(state) && interaction.focusRing,
        ]}
        onPress={() => onChange(option.id)}
        onLayout={wrap ? undefined : (e) => {
          // Bring a selected chip that starts off screen into view.
          const { x, width } = e.nativeEvent.layout;
          if (selected && x + width + GUTTER > viewportWidth) {
            scrollRef.current?.scrollTo({ x: x - GUTTER, animated: false });
          }
        }}
        hitSlop={{ top: 5, bottom: 5 }}
        accessibilityRole="radio"
        aria-checked={selected}
        accessibilityLabel={option.name}
        testID={testID ? `${testID}-${option.id}` : undefined}
      >
        <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
          {option.name}
        </Text>
      </Pressable>
    );
  });

  if (wrap) {
    return (
      <View
        style={styles.wrapRow}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {chips}
      </View>
    );
  }

  return (
    <View
      style={[styles.frame, Platform.OS === "web" && styles.frameWeb]}
      onLayout={(e) => setFrameWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, Platform.OS === "web" && styles.rowWeb]}
        onContentSizeChange={(width) => setContentWidth(width)}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {chips}
      </ScrollView>
      {hasMore
        ? (
          <LinearGradient
            pointerEvents="none"
            // An 8-digit hex keeps the cream hue: "transparent" fades through gray on web.
            colors={[`${colors.cream}00`, colors.cream]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fade}
          />
        )
        : null}
    </View>
  );
}

const RING_ROOM = 4;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    frame: { marginHorizontal: -GUTTER },
    // The scroll view clips what overflows it: on web, room above and below the chips keeps
    // the focus ring in view, without moving the row.
    frameWeb: { marginVertical: -RING_ROOM },
    row: { gap: 8, paddingHorizontal: GUTTER },
    rowWeb: { paddingVertical: RING_ROOM },
    wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    // 34px high, hitSlop adds 10px for the 44px touch target.
    chip: {
      justifyContent: "center",
      minHeight: 34,
      paddingHorizontal: 14,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
    },
    chipPressed: { backgroundColor: c.line },
    chipSelected: { backgroundColor: c.ink, borderColor: c.ink },
    label: { color: c.text, fontSize: 13, fontWeight: "700" },
    labelSelected: { color: c.cream },
    fade: { position: "absolute", top: 0, right: 0, bottom: 0, width: 40 },
  });
