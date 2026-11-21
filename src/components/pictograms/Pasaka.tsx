import React from "react";
import { Path, Rect } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Pasaka: the leather glove, with its cuff. */
export function Pasaka(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M8.5 17V8a5.25 5.25 0 0 1 10.5 0v9" />
      <Path d="M8.5 12.5 6.2 10.2a1.7 1.7 0 0 0-2.4 2.4l4.7 4.7" />
      <Rect x="7.5" y="17" width="12.5" height="4" rx="1" />
      <Path d="M11 9a2.75 2.75 0 0 1 5.5 0" />
    </Pictogram>
  );
}
