import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Joko garbi: the short chistera, on its glove. */
export function JokoGarbi(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M8 19.5C12.5 19 16 15.5 16.5 9.5C15 13 10.5 15 5 15.5z" />
      <Path d="M5 15.5 3.5 17 6.5 21 8 19.5M7 17.3C10.5 16.8 14 15 15.8 12" />
    </Pictogram>
  );
}
