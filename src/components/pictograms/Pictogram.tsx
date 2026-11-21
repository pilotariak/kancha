import type { LucideProps } from "lucide-react-native";
import React, { type ReactNode } from "react";
import { Platform, type ViewProps } from "react-native";
import Svg from "react-native-svg";

/** The props of a lucide-react-native icon, so a pictogram sits with the icons. */
export type PictogramProps = LucideProps;

// Pictograms are decorative: the text beside them names the specialty.
const HIDDEN: Pick<
  ViewProps,
  "aria-hidden" | "accessibilityElementsHidden" | "importantForAccessibility"
> = Platform.OS === "web"
  ? { "aria-hidden": true }
  : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" };

/**
 * The frame of every pictogram, with the defaults of lucide's createLucideIcon: a 24 viewBox, a 2
 * stroke, round caps and joins, no fill. The drawing inherits them: react-native-svg passes them
 * from the Svg to its root group.
 */
export function Pictogram(
  { color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, children, ...rest }:
    & PictogramProps
    & { children: ReactNode },
) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      {...HIDDEN}
    >
      {children}
    </Svg>
  );
}
