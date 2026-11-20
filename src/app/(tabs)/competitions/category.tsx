import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

/** The results screen picks the category now; old links land there with their specialty. */
export default function CategoryRedirect() {
  const { id, specialtyId } = useLocalSearchParams<{ id: string; specialtyId?: string }>();
  return (
    <Redirect href={{ pathname: "/(tabs)/competitions/details", params: { id, specialtyId } }} />
  );
}
