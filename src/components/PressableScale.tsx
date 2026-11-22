import * as Haptics from "expo-haptics";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import { Animated, Platform, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

import { isFocusVisible, useInteractionStyles } from "@/hooks/use-interaction-styles";
import { useTheme } from "@/hooks/use-theme";

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

type Handler<K extends keyof PressableProps> = NonNullable<PressableProps[K]>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const isWeb = Platform.OS === "web";
const isAndroid = Platform.OS === "android";

// React Native masks a bounded ripple with a rectangle. Drawn in the foreground of a view with
// overflow hidden, it is clipped to the view's own rounded border instead.
const rippleClip: ViewStyle = { overflow: "hidden" };

/**
 * A pressable card or button. iOS and web shrink it on press; on Android, a card that carries
 * its own `style` shows a ripple bounded to its radius instead. A bare wrapper around a styled
 * child keeps the scale on Android too: it has no radius for the ripple to follow, and its
 * child's fill would hide a background ripple.
 */
export function PressableScale({
  children,
  style,
  android_ripple,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const interaction = useInteractionStyles();
  const { colors } = useTheme();
  const ripples = isAndroid && style != null;
  // Web only. An Animated component cannot take a style callback, so the hovered and
  // focused states are tracked here instead of read from Pressable's state.
  const [hovered, setHovered] = useState(false);
  const [focusRing, setFocusRing] = useState(false);

  const animateTo = useCallback(
    (value: number) => {
      Animated.spring(scale, {
        toValue: value,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    },
    [scale],
  );

  const handlePressIn = useCallback(
    (event: Parameters<Handler<"onPressIn">>[0]) => {
      Haptics.selectionAsync().catch(() => undefined);
      if (!ripples) animateTo(0.96);
      onPressIn?.(event);
    },
    [animateTo, onPressIn, ripples],
  );

  const handlePressOut = useCallback(
    (event: Parameters<Handler<"onPressOut">>[0]) => {
      if (!ripples) animateTo(1);
      onPressOut?.(event);
    },
    [animateTo, onPressOut, ripples],
  );

  const webHandlers: Partial<PressableProps> = isWeb
    ? {
      onHoverIn: (event: Parameters<Handler<"onHoverIn">>[0]) => {
        setHovered(true);
        onHoverIn?.(event);
      },
      onHoverOut: (event: Parameters<Handler<"onHoverOut">>[0]) => {
        setHovered(false);
        onHoverOut?.(event);
      },
      onFocus: (event: Parameters<Handler<"onFocus">>[0]) => {
        setFocusRing(isFocusVisible());
        onFocus?.(event);
      },
      onBlur: (event: Parameters<Handler<"onBlur">>[0]) => {
        setFocusRing(false);
        onBlur?.(event);
      },
    }
    : { onHoverIn, onHoverOut, onFocus, onBlur };

  return (
    <AnimatedPressable
      {...props}
      {...webHandlers}
      android_ripple={ripples
        ? { color: colors.ripple, foreground: true, ...android_ripple }
        : android_ripple}
      style={[
        style,
        ripples && rippleClip,
        // A bare wrapper around a styled child has no radius for the shadow to follow.
        hovered && style != null && interaction.hover,
        focusRing && interaction.focusRing,
        !ripples && { transform: [{ scale }] },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
