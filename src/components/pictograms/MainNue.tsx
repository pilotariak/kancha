import React from "react";
import { Path } from "react-native-svg";

import { Pictogram, type PictogramProps } from "./Pictogram";

/** Main nue: the bare hand, palm open. */
export function MainNue(props: PictogramProps) {
  return (
    <Pictogram {...props}>
      <Path d="M7 13.2V6.5a1.75 1.75 0 0 1 3.5 0V5a1.75 1.75 0 0 1 3.5 0v.75a1.75 1.75 0 0 1 3.5 0V8a1.5 1.5 0 0 1 3 0v6c0 4.4-2.9 7-6.5 7h-1.5c-1.9 0-3.2-.5-4.3-1.6l-4.3-5a1.6 1.6 0 0 1 2.4-2.1z" />
      <Path d="M10.5 6.5v5M14 5.75v5.75M17.5 8v3.5" />
    </Pictogram>
  );
}
