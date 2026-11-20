import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Check, ChevronDown } from "@/components/icons";
import type { Palette } from "@/constants/colors";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface SelectFieldProps {
  /** What is chosen, e.g. "Specialty": the list title and the screen reader label. */
  label: string;
  hint?: string;
  options: readonly { id: string; name: string }[];
  value?: string;
  onChange: (id: string) => void;
  testID?: string;
}

/**
 * One choice among long names: a field that shows the current name on one
 * line and opens the full list in a sheet from the bottom of the screen.
 */
export function SelectField({ label, hint, options, value, onChange, testID }: SelectFieldProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={[label, selected?.name].filter(Boolean).join(", ")}
        accessibilityHint={hint}
        testID={testID}
      >
        <Text style={styles.value} numberOfLines={1}>{selected?.name ?? ""}</Text>
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
          <View style={[styles.sheet, { paddingBottom: 12 + insets.bottom }]}>
            <Text style={styles.sheetTitle} accessibilityRole="header">{label}</Text>
            <ScrollView accessibilityRole="radiogroup">
              {options.map((option) => {
                const active = option.id === value;
                return (
                  <Pressable
                    key={option.id}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => {
                      setOpen(false);
                      if (!active) onChange(option.id);
                    }}
                    accessibilityRole="radio"
                    aria-checked={active}
                    accessibilityLabel={option.name}
                    testID={testID ? `${testID}-option-${option.id}` : undefined}
                  >
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {option.name}
                    </Text>
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
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
    },
    fieldPressed: { backgroundColor: c.card },
    value: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "700" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: c.shadow },
    sheet: {
      maxHeight: "75%",
      paddingTop: 18,
      paddingHorizontal: 8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: c.white,
    },
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
    optionPressed: { backgroundColor: c.cream },
    optionLabel: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "600" },
    optionLabelActive: { fontWeight: "800" },
  });
