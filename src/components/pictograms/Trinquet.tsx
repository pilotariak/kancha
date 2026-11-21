import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Trinquet: the closed court, the tambour slanting off the right wall. */
export function Trinquet(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M8 6h8v9H8z" />
      <Path d="M8 6 3 3v18l5-6M16 6l5-3v18l-5-6M16 15l5-4" />
    </Pictogram>
  );
}
