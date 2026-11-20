import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

/** The results screen picks the specialty now; old links land there. */
export default function SpecialtyRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: "/(tabs)/competitions/details", params: { id } }} />;
}
