import * as Haptics from "expo-haptics";
import React, { ReactNode, useCallback, useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

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
    (event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      Haptics.selectionAsync().catch(() => undefined);
      animateTo(0.98);
      onPressIn?.(event);
    },
    [animateTo, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      animateTo(1);
      onPressOut?.(event);
    },
    [animateTo, onPressOut],
  );

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
