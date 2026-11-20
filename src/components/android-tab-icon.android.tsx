import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { VectorIcon } from "expo-router/unstable-native-tabs";
import React, { type ComponentProps } from "react";

/**
 * A native tab icon for Android: a Material Design Icons glyph that `VectorIcon` renders to an
 * image. Native tabs on Android take an image or a drawable, not the Lucide SVG components;
 * drawables come with #99. Android-only, so the 1.3 MB icon font stays out of the iOS bundle.
 */
export function androidTabIcon(name: ComponentProps<typeof MaterialCommunityIcons>["name"]) {
  return <VectorIcon family={MaterialCommunityIcons} name={name} />;
}
