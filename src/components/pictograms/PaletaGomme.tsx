import React from "react";
import { Circle, Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Paleta gomme, pleine and creuse: the wooden paleta and its ball. */
export function PaletaGomme(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M10.5 13.5A6 4.5 -45 0 1 18.74 5.26A6 4.5 -45 0 1 10.5 13.5z" />
      <Path d="M9.44 12.44 4.95 16.93a1.5 1.5 0 0 0 2.12 2.12l4.49-4.49" />
      <Circle cx="6" cy="6.5" r="2" />
    </Pictogram>
  );
}
