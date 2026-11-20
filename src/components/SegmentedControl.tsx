import type { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

const TRACK_PADDING = 3;
const SEGMENT_GAP = 2;

/**
 * The narrowest segment that keeps its icon. Padding, icon and gap take 36px; the rest must hold
 * the longest label, "Clasificación" (es, 83px at 13px bold in Chrome on macOS), with 5px to
 * spare for native fonts. Narrower segments drop their icons rather than truncate a label.
 */
const MIN_SEGMENT_WITH_ICON = 124;

/**
 * Switches between views of the same content: a neutral track, the active
 * segment in white with a ring and a shadow, ink text. No red: picking a view is not an action.
 */
export function SegmentedControl<T extends string>(
  { segments, value, onChange, testID }: SegmentedControlProps<T>,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  // Decided from the track, not the window: on wide web layouts the control sits in a grid
  // cell. Hidden until measured, so no frame shows a truncated label.
  const [showIcons, setShowIcons] = useState(false);

  function onTrackLayout(e: LayoutChangeEvent) {
    const count = segments.length;
    const segment = (e.nativeEvent.layout.width - 2 * TRACK_PADDING - (count - 1) * SEGMENT_GAP)
      / count;
    setShowIcons(segment >= MIN_SEGMENT_WITH_ICON);
  }

  return (
    <View
      style={styles.track}
      onLayout={onTrackLayout}
      accessibilityRole="tablist"
      testID={testID}
    >
      {segments.map(({ value: option, label, icon: Icon }) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            style={(state: InteractionState) => [
              styles.segment,
              active ? styles.segmentActive : state.hovered && styles.segmentHovered,
              showsFocusRing(state) && interaction.focusRing,
            ]}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            aria-selected={active}
            testID={testID ? `${testID}-${option}` : undefined}
          >
            {Icon && showIcons
              ? <Icon size={14} color={active ? colors.ink : colors.text} />
              : null}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    // 3 + 38 + 3: the 44px touch target.
    track: {
      flexDirection: "row",
      gap: SEGMENT_GAP,
      padding: TRACK_PADDING,
      borderRadius: 9999,
      backgroundColor: c.line,
    },
    segment: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 38,
      paddingHorizontal: 8,
      borderRadius: 9999,
    },
    // The thumb barely contrasts with the track (1.3:1 light, 1.2:1 dark): a lineStrong ring and
    // a shadow, not a bolder label, mark it, so the label keeps its width when selected. A
    // shadow takes no room from the label, where a border would.
    segmentActive: {
      backgroundColor: c.white,
      boxShadow: `0 0 0 1px ${c.lineStrong}, 0 1px 4px ${c.shadow}`,
    },
    // Web only: a tint on an inactive segment under the pointer.
    segmentHovered: { backgroundColor: c.lineStrong },
    label: { color: c.text, fontSize: 13, fontWeight: "700" },
    labelActive: { color: c.ink },
  });
