import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface FilterChipsProps {
  options: readonly { id: string; name: string }[];
  value?: string;
  onChange: (id: string) => void;
  /** Names the group for screen readers. */
  accessibilityLabel: string;
  testID?: string;
}

const GUTTER = 20;

/**
 * One choice among short names, as a row of chips. The row bleeds over the
 * screen gutter and scrolls sideways; a cream fade on the right edge shows
 * that more chips follow.
 */
export function FilterChips(props: FilterChipsProps) {
  // A new set of chips mounts a new row: it resets the scroll state, and on web
  // onLayout only fires on a size change, so a chip that only moved would not
  // scroll into view.
  return <ChipRow key={props.options.map((o) => o.id).join(",")} {...props} />;
}

function ChipRow({ options, value, onChange, accessibilityLabel, testID }: FilterChipsProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const hasMore = contentWidth - frameWidth - offset > 1;

  return (
    <View style={styles.frame} onLayout={(e) => setFrameWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        onContentSizeChange={(width) => setContentWidth(width)}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.chip,
                selected ? styles.chipSelected : pressed && styles.chipPressed,
              ]}
              onPress={() => onChange(option.id)}
              onLayout={(e) => {
                // Bring a selected chip that starts off screen into view.
                const { x, width } = e.nativeEvent.layout;
                if (selected && x + width + GUTTER > screenWidth) {
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
        })}
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    frame: { marginHorizontal: -GUTTER },
    row: { gap: 8, paddingHorizontal: GUTTER },
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
