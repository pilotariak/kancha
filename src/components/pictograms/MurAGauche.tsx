import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Mur à gauche: the front wall and the left wall. */
export function MurAGauche(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M10 5h10v10H10z" />
      <Path d="M10 5 3 2v19l7-6" />
    </Pictogram>
  );
}
