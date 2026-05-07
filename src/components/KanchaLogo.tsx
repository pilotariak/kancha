import React from "react";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from "react-native-svg";

import { KanchaColors } from "@/constants/colors";

type LogoVariant = "on-dark" | "on-light";

interface KanchaLogoProps {
  size?: number;
  variant?: LogoVariant;
}

export function KanchaLogo({ size = 96, variant = "on-dark" }: KanchaLogoProps) {
  const onDark = variant === "on-dark";

  // on-light: stronger ring + red-dark K so it reads on cream backgrounds
  const ballRing = onDark ? "rgba(200,16,46,0.12)" : "rgba(200,16,46,0.28)";
  const seamColor = KanchaColors.red;
  const kColor = onDark ? KanchaColors.red : KanchaColors.redDark;

  const seamW = size * 0.042;
  const kW = size * 0.065; // slightly lighter than before — avoids overwhelming the seams

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {
          /*
           * Radial gradient offset to top-left simulates a light source, giving
           * the flat disc a sphere quality without a separate shadow layer.
           */
        }
        <RadialGradient id="ball" cx="38%" cy="32%" r="72%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#EDE8E2" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Pelota ball — gradient disc + subtle brand ring */}
      <Circle cx="50" cy="50" r="46" fill="url(#ball)" />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={ballRing} strokeWidth="2" />

      {/* Specular highlight — reinforces top-left light source */}
      <Ellipse cx="36" cy="30" rx="12" ry="7" fill="rgba(255,255,255,0.42)" />

      {
        /*
         * Seam arcs — quadratic Béziers. Control point (50,50) means each
         * arc midpoint lands at (38,50) and (62,50), framing the K vertex.
         */
      }
      <Path
        d="M 26 15 Q 50 50 26 85"
        fill="none"
        stroke={seamColor}
        strokeWidth={seamW}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Path
        d="M 74 15 Q 50 50 74 85"
        fill="none"
        stroke={seamColor}
        strokeWidth={seamW}
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* K monogram — three strokes anchored at (40, 50), drawn above seams */}
      <Path
        d="M 40 27 L 40 73"
        fill="none"
        stroke={kColor}
        strokeWidth={kW}
        strokeLinecap="round"
      />
      <Path
        d="M 40 50 L 63 27"
        fill="none"
        stroke={kColor}
        strokeWidth={kW}
        strokeLinecap="round"
      />
      <Path
        d="M 40 50 L 64 73"
        fill="none"
        stroke={kColor}
        strokeWidth={kW}
        strokeLinecap="round"
      />
    </Svg>
  );
}
