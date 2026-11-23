import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { Palette } from "@/constants/colors";
import { formLabel, type FormResult } from "@/features/rankings/ranking";
import { useThemedStyles } from "@/hooks/use-theme";

interface FormSquaresProps {
  /** Oldest first. */
  form: readonly FormResult[];
  /** The side of a square: 10px in a ranking row. */
  size?: number;
}

/**
 * The last results as squares: a win filled green, a loss outlined red, so not by colour alone.
 * One image, labelled with the results in words.
 */
export function FormSquares({ form, size = 10 }: FormSquaresProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const square = { width: size, height: size, borderRadius: Math.round(size / 5) };

  return (
    <View
      style={[styles.form, { gap: Math.round(size * 0.3) }]}
      role="img"
      accessibilityLabel={formLabel(form, t)}
    >
      {form.map((result, i) => (
        <View
          key={i}
          style={[square, result === "W" ? styles.squareWin : styles.squareLoss]}
        />
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    form: { flexDirection: "row" },
    squareWin: { backgroundColor: c.green },
    squareLoss: { borderWidth: 2, borderColor: c.red },
  });
