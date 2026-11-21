import React, { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Check, ChevronDown } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { TEXT_MAX_WIDTH } from "@/features/layout/breakpoints";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useWebLayout } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

export interface SelectOption {
  id: string;
  /** Shown, and the screen reader label of the option. */
  name: string;
}

interface SelectFieldProps<T extends SelectOption> {
  /** What is chosen, e.g. "Specialty": the list title and the screen reader label. */
  label: string;
  hint?: string;
  options: readonly T[];
  value?: string;
  onChange: (id: string) => void;
  /**
   * Draws an option in the closed field (`inField`) and in the list, in place of its name.
   * `textStyle` is the style the name has there, so a name drawn as is keeps its look.
   */
  renderOption?: (
    option: T,
    context: { inField: boolean; textStyle: StyleProp<TextStyle> },
  ) => ReactNode;
  testID?: string;
}

/**
 * One choice among long names: a field that shows the current name on one
 * line and opens the full list in a sheet from the bottom of the screen.
 * `renderOption` draws the options otherwise, on several lines if need be.
 */
export function SelectField<T extends SelectOption>(
  { label, hint, options, value, onChange, renderOption, testID }: SelectFieldProps<T>,
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const insets = useSafeAreaInsets();
  const wide = useWebLayout().columns > 1;
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <>
      <Pressable
        style={(state: InteractionState) => [
          styles.field,
          state.pressed && styles.fieldPressed,
          state.hovered && interaction.hover,
          showsFocusRing(state) && interaction.focusRing,
        ]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={[label, selected?.name].filter(Boolean).join(", ")}
        accessibilityHint={hint}
        testID={testID}
      >
        {renderOption && selected
          ? (
            <View style={styles.valueBox}>
              {renderOption(selected, { inField: true, textStyle: styles.valueText })}
            </View>
          )
          : (
            <Text style={[styles.valueBox, styles.valueText]} numberOfLines={1}>
              {selected?.name ?? ""}
            </Text>
          )}
        <ChevronDown color={colors.muted} size={18} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
          />
          <View
            style={[
              styles.sheet,
              wide && styles.sheetCentered,
              { paddingBottom: 12 + insets.bottom },
            ]}
          >
            <Text style={styles.sheetTitle} accessibilityRole="header">{label}</Text>
            <ScrollView accessibilityRole="radiogroup">
              {options.map((option) => {
                const active = option.id === value;
                return (
                  <Pressable
                    key={option.id}
                    style={(state: InteractionState) => [
                      styles.option,
                      (state.pressed || state.hovered) && styles.optionPressed,
                      showsFocusRing(state) && interaction.focusRing,
                    ]}
                    onPress={() => {
                      setOpen(false);
                      if (!active) onChange(option.id);
                    }}
                    accessibilityRole="radio"
                    aria-checked={active}
                    accessibilityLabel={option.name}
                    testID={testID ? `${testID}-option-${option.id}` : undefined}
                  >
                    {renderOption
                      ? (
                        <View style={styles.optionBox}>
                          {renderOption(option, {
                            inField: false,
                            textStyle: [styles.optionLabel, active && styles.optionLabelActive],
                          })}
                        </View>
                      )
                      : (
                        <Text
                          style={[
                            styles.optionBox,
                            styles.optionLabel,
                            active && styles.optionLabelActive,
                          ]}
                        >
                          {option.name}
                        </Text>
                      )}
                    {active ? <Check color={colors.ink} size={18} strokeWidth={3} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 16,
      // Room for a value drawn on several lines by renderOption.
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
    },
    fieldPressed: { backgroundColor: c.card },
    valueBox: { flex: 1 },
    valueText: { color: c.ink, fontSize: 15, fontWeight: "700" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: c.shadow },
    sheet: {
      maxHeight: "75%",
      paddingTop: 18,
      paddingHorizontal: 8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: c.white,
    },
    // Wider than a phone: the text column width, centered, instead of the window width.
    sheetCentered: { width: "100%", maxWidth: TEXT_MAX_WIDTH, alignSelf: "center" },
    sheetTitle: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
    },
    // Also the hovered row on web.
    optionPressed: { backgroundColor: c.cream },
    optionBox: { flex: 1 },
    optionLabel: { color: c.ink, fontSize: 15, fontWeight: "600" },
    optionLabelActive: { fontWeight: "800" },
  });
