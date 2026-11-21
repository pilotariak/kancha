import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Grand chistera: the long chistera, on its glove. */
export function GrandChistera(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M7.5 18C14 17.5 19.5 12 20.5 3.5C18.5 9.5 11 13.8 4 14.5z" />
      <Path d="M4 14.5 2.5 16 6 19.5 7.5 18M6 16.2C11.5 16 17 12 19.5 7" />
    </Pictogram>
  );
}
