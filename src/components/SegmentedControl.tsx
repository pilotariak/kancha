import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

/**
 * Switches between views of the same content: a neutral track, the active
 * segment in white, ink text. No red: picking a view is not an action.
 */
export function SegmentedControl<T extends string>(
  { segments, value, onChange, testID }: SegmentedControlProps<T>,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();

  return (
    <View style={styles.track} accessibilityRole="tablist" testID={testID}>
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
            {Icon ? <Icon size={14} color={active ? colors.ink : colors.text} /> : null}
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
      gap: 2,
      padding: 3,
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
    segmentActive: { backgroundColor: c.white },
    // Web only: a tint on an inactive segment under the pointer.
    segmentHovered: { backgroundColor: c.lineStrong },
    label: { color: c.text, fontSize: 13, fontWeight: "600" },
    labelActive: { color: c.ink, fontWeight: "800" },
  });
