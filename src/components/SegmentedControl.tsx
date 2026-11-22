import type { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { SEGMENT_GAP, segmentFit, TRACK_PADDING } from "@/features/layout/segments";
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
  /** Icons only, in 44px segments, for a control beside other filters; labels name them. */
  iconOnly?: boolean;
  testID?: string;
}

/**
 * Switches between views of the same content: a neutral track, the active
 * segment in white with a ring and a shadow, ink text. No red: picking a view is not an action.
 */
export function SegmentedControl<T extends string>(
  { segments, value, onChange, iconOnly = false, testID }: SegmentedControlProps<T>,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  // Decided from the track, not the window: on wide web layouts the control sits in a grid
  // cell. Until it is measured, segments take their labels' widths without icons, so no frame
  // shows a truncated label.
  const [equal, setEqual] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  function onTrackLayout(e: LayoutChangeEvent) {
    const fit = segmentFit(e.nativeEvent.layout.width, segments.length);
    setEqual(fit.equal);
    setShowIcons(fit.icons);
  }

  return (
    <View
      style={styles.track}
      onLayout={iconOnly ? undefined : onTrackLayout}
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
              iconOnly
                ? styles.segmentIconOnly
                : equal
                ? styles.segmentEqual
                : styles.segmentFit,
              active ? styles.segmentActive : state.hovered && styles.segmentHovered,
              showsFocusRing(state) && interaction.focusRing,
            ]}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            aria-selected={active}
            testID={testID ? `${testID}-${option}` : undefined}
          >
            {Icon && (showIcons || iconOnly)
              ? <Icon size={iconOnly ? 18 : 14} color={active ? colors.ink : colors.text} />
              : null}
            {iconOnly
              ? null
              : (
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                  {label}
                </Text>
              )}
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 38,
      paddingHorizontal: 8,
      borderRadius: 9999,
    },
    segmentEqual: { flex: 1 },
    // Too narrow for equal segments: each starts from its label's width and they share the rest.
    segmentFit: { flexGrow: 1, flexShrink: 1, flexBasis: "auto" },
    segmentIconOnly: { width: 44, paddingHorizontal: 0 },
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
