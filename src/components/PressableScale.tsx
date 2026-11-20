import * as Haptics from "expo-haptics";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import { Animated, Platform, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

import { isFocusVisible, useInteractionStyles } from "@/hooks/use-interaction-styles";

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

type Handler<K extends keyof PressableProps> = NonNullable<PressableProps[K]>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const isWeb = Platform.OS === "web";

export function PressableScale({
  children,
  style,
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
      animateTo(0.96);
      onPressIn?.(event);
    },
    [animateTo, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: Parameters<Handler<"onPressOut">>[0]) => {
      animateTo(1);
      onPressOut?.(event);
    },
    [animateTo, onPressOut],
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
      style={[
        style,
        // A bare wrapper around a styled child has no radius for the shadow to follow.
        hovered && style != null && interaction.hover,
        focusRing && interaction.focusRing,
        { transform: [{ scale }] },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
