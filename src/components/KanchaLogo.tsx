import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { KanchaColors } from "@/constants/colors";

/**
 * - `tile`: the red tile of the app icon, cream mark, rounded corners. For a cream, white or
 *   dark surface: the web navigation rail, the About screen. `size` square.
 * - `mark`: the cream mark alone. For a red surface: the band of `ShareCard`. `size` high, as
 *   wide as the mark, so it lines up with the text beside and below it.
 */
type LogoVariant = "tile" | "mark";

interface KanchaLogoProps {
  size?: number;
  variant?: LogoVariant;
}

// The arms of the K, 150 units wide in the reference drawing (assets/icon-square.svg), cut flat
// at the top and bottom of the stem. They are drawn as the outlines of the clipped strokes, so
// the logo needs no clipPath: its id would be shared by every logo of a web page.
const UPPER_ARM = "M384.4 611.6L754.4 221.6L727.4 196L572 196L275.6 508.4Z";
const LOWER_ARM = "M384.4 412.4L754.4 802.4L727.4 828L572 828L275.6 515.6Z";

// The mark spans x 232 (the stem's left edge) to 812 (the ball's right edge) of the 1024 box.
const MARK_LEFT = 232;
const MARK_WIDTH = 580;

/**
 * Errebote, the Kancha mark (DESIGN.md, App icon and logo): a heavy K cut like a scoreboard
 * digit, whose open mouth catches the ball. Drawn in the 1024 viewBox of the app icon, so the
 * mark has the same height in both variants; `mark` trims the box to the mark's width. Its
 * colors are the brand's and do not follow the theme, like the app icon.
 */
export function KanchaLogo({ size = 96, variant = "tile" }: KanchaLogoProps) {
  const ink = KanchaColors.cream;
  const tile = variant === "tile";

  return (
    <Svg
      width={tile ? size : (size * MARK_WIDTH) / 1024}
      height={size}
      viewBox={tile ? "0 0 1024 1024" : `${MARK_LEFT} 0 ${MARK_WIDTH} 1024`}
    >
      {tile ? <Rect width="1024" height="1024" rx="230" fill={KanchaColors.redFill} /> : null}
      {/* K: stem */}
      <Rect x="232" y="196" width="168" height="632" rx="20" fill={ink} />
      {/* K: arms */}
      <Path d={UPPER_ARM} fill={ink} />
      <Path d={LOWER_ARM} fill={ink} />
      {/* Pelota, in the mouth of the K */}
      <Circle cx="716" cy="512" r="96" fill={ink} />
    </Svg>
  );
}
