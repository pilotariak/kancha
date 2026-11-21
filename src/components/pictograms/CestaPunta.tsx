import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Cesta punta: the deep basket, its tip curled, on its glove. */
export function CestaPunta(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M7.5 18.5C15.5 18.5 21.5 12.5 20.5 5.5C20 3.2 17.8 3 16.8 4.3C16 9.5 11 14 4 14.5z" />
      <Path d="M4 14.5 2.5 16 6 20 7.5 18.5M6 16.4C12 16.5 17.5 13 18.8 6.5" />
    </Pictogram>
  );
}
