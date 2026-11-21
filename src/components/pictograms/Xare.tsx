import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Xare: the long racket, its net strung along the hoop. */
export function Xare(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M10.4 13.6A7 4 -45 0 1 20.3 3.7A7 4 -45 0 1 10.4 13.6z" />
      <Path d="M10.4 13.6 3.5 20.5M12.7 13.5l6.7-6.7M10.5 11.3l6.7-6.7" />
    </Pictogram>
  );
}
