import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

import type { Palette } from "@/constants/colors";
import { gauge, hatchLines } from "@/features/slots/gauge";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const BAR_HEIGHT = 14;
/** The minimum line stands this far above and below the bar. */
const LINE_OVERHANG = 5;
const HATCH_GAP = 6;

// The drawing repeats the label of the gauge: screen readers read the label only.
const HIDDEN = Platform.OS === "web"
  ? { "aria-hidden": true as const }
  : {
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants" as const,
  };

/**
 * The gauge of a session (#157): OK answers solid green, Dispo answers hatched amber, the
 * minimum as a line across the bar and the number of places at its end. The counts are pik's,
 * and Dispo answers stay out of the minimum: the state beside the gauge is pik's too.
 *
 * The bar is drawn in pixels once its width is known, so the hatching keeps its 45° on every
 * width; react-native-svg draws plain lines the same way on iOS, Android and the web.
 */
export function SessionGauge(
  { ok, dispo, minPlayers, places, testID }: {
    ok: number;
    dispo: number;
    minPlayers: number;
    places: number;
    testID?: string;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const model = gauge({ ok, dispo, minPlayers, places });
  const x = (fraction: number) => fraction * width;
  // The label of the minimum hangs from its line, toward the middle of the bar.
  const minLabelSide = model.minAt > 0.5
    ? { right: Math.max(0, width - x(model.minAt) - 1) }
    : { left: Math.max(0, x(model.minAt) - 1) };

  return (
    <View
      style={styles.root}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t("slot.session_screen.gauge_label", {
        ok,
        dispo,
        min: minPlayers,
        places,
      })}
    >
      <View style={styles.minLabelRow} {...HIDDEN}>
        {width > 0 && (
          <Text style={[styles.minLabel, minLabelSide]} numberOfLines={1}>
            {t("slot.session_screen.min_marker", { count: minPlayers })}
          </Text>
        )}
      </View>
      <View
        style={styles.barArea}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        {...HIDDEN}
      >
        <View style={styles.track}>
          {width > 0 && (
            <Svg width={width} height={BAR_HEIGHT}>
              <Rect x={0} y={0} width={x(model.okEnd)} height={BAR_HEIGHT} fill={colors.green} />
              <Rect
                x={x(model.okEnd)}
                y={0}
                width={x(model.dispoEnd) - x(model.okEnd)}
                height={BAR_HEIGHT}
                fill={colors.amberBg}
              />
              {hatchLines(x(model.okEnd), x(model.dispoEnd), BAR_HEIGHT, HATCH_GAP).map((line) => (
                <Line
                  key={`${line.x1}-${line.y1}`}
                  {...line}
                  stroke={colors.amber}
                  strokeWidth={2}
                />
              ))}
              {model.ticks.map((tick) => (
                <Line
                  key={tick}
                  x1={x(tick)}
                  y1={0}
                  x2={x(tick)}
                  y2={BAR_HEIGHT}
                  stroke={colors.card}
                  strokeWidth={1.5}
                />
              ))}
            </Svg>
          )}
        </View>
        {width > 0 && model.minAt > 0 && (
          <View
            style={[styles.minLine, { left: Math.min(width - 2, Math.max(0, x(model.minAt) - 1)) }]}
          />
        )}
      </View>
      <Text style={styles.places} {...HIDDEN}>
        {t("slot.session_screen.places_marker", { count: places })}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { gap: 4 },
    minLabelRow: { height: 16 },
    minLabel: {
      position: "absolute",
      top: 0,
      color: c.ink,
      fontSize: 11,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    barArea: { height: BAR_HEIGHT + LINE_OVERHANG * 2, justifyContent: "center" },
    track: {
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      overflow: "hidden",
      backgroundColor: c.line,
    },
    minLine: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 2,
      borderRadius: 1,
      backgroundColor: c.ink,
    },
    places: {
      alignSelf: "flex-end",
      color: c.placeholder,
      fontSize: 12,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
  });
