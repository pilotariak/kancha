import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Place libre: the fronton, a single wall open on the court. */
export function PlaceLibre(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M2 19h20M3 16h18" />
      <Path d="M3 19v-7c2.5 0 4.5-.5 6-3s1.5-4 3-4 1.5 1.5 3 4 3.5 3 6 3v7" />
    </Pictogram>
  );
}
