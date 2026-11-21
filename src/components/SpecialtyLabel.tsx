import React from "react";
import { type StyleProp, StyleSheet, Text, type TextStyle, View } from "react-native";

import { PICTOGRAMS } from "@/components/pictograms";
import type { Palette } from "@/constants/colors";
import { splitSpecialtyName } from "@/features/competitions/specialtyName";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

interface SpecialtyLabelProps {
  /** The specialty name from Frontis: "Mur à Gauche / P.G. Creuse Masculin Individuel". */
  name: string;
  /** The style of the name: the discipline line takes it, and so does a name that does not split. */
  textStyle?: StyleProp<TextStyle>;
  /** Lines of a name that does not split. Unset, it wraps. The discipline line always wraps. */
  numberOfLines?: number;
  testID?: string;
}

/**
 * A specialty name in two lines: the court, small and muted, above the discipline and the rest,
 * each after its pictogram. A name that does not split shows whole, in `textStyle`.
 */
export function SpecialtyLabel(
  { name, textStyle, numberOfLines, testID }: SpecialtyLabelProps,
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const split = splitSpecialtyName(name);
  if (!split) {
    return <Text style={textStyle} numberOfLines={numberOfLines} testID={testID}>{name}</Text>;
  }

  const Discipline = PICTOGRAMS[split.disciplineKey];
  const Court = split.courtKey ? PICTOGRAMS[split.courtKey] : null;
  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.line}>
        <View style={styles.courtPictogram}>
          {Court ? <Court color={colors.muted} size={16} /> : null}
        </View>
        <Text style={styles.court} testID={testID && `${testID}-court`}>{split.court}</Text>
      </View>
      <View style={styles.line}>
        <Discipline color={colors.ink} size={20} />
        <Text style={[textStyle, styles.discipline]} testID={testID && `${testID}-discipline`}>
          {split.label}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { gap: 2 },
    // The pictograms share a 20px column, so the court and the discipline start at one edge.
    line: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    courtPictogram: { width: 20, height: 16, alignItems: "center" },
    court: { flex: 1, color: c.muted, fontSize: 12, lineHeight: 16, fontWeight: "700" },
    discipline: { flex: 1, lineHeight: 20 },
  });
