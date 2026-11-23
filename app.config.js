const { version } = require("./package.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Kancha",
    slug: "kancha",
    version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kancha",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      // iOS 18 home screen appearances, both derived from icon.png with no new drawing. Apple
      // asks for a dark icon on a transparent background, which the system fills, and a
      // grayscale tinted icon: here the white glyph on opaque black, as Expo fills a tinted
      // icon's transparency with white. `light` must be set, or the dark image becomes the
      // default icon.
      icon: {
        light: "./assets/images/icon.png",
        dark: "./assets/images/icon-dark.png",
        tinted: "./assets/images/icon-tinted.png",
      },
      supportsTablet: false,
      bundleIdentifier: "io.pilotariak.kancha",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F7F4EF",
        // Themed icons (Android 13 and up): the white K of icon.svg on a transparent
        // background, inside the 66 dp safe zone (assets/icon-monochrome.svg). The launcher
        // tints it; icon-tinted.png is opaque and cannot serve here.
        monochromeImage: "./assets/images/icon-monochrome.png",
      },
      // Off, which writes android:enableOnBackInvokedCallback="false": React Native's
      // ReactActivity keeps an OnBackPressedCallback enabled at all times, so the system plays
      // no back preview, and react-native-screens 4.16 has no predictive back for its stack.
      predictiveBackGestureEnabled: false,
      package: "io.pilotariak.kancha",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          root: "src/app",
        },
      ],
      [
        // The scoreboard digits (src/constants/typography.ts): native builds embed them, so they
        // are there at launch. Web loads them with useFonts in src/app/_layout.tsx.
        "expo-font",
        {
          fonts: [
            "./assets/fonts/BarlowCondensed-Bold.ttf",
            "./assets/fonts/BarlowCondensed-Black.ttf",
          ],
        },
      ],
      "expo-web-browser",
      [
        // The pik player token (src/api/pik-token.ts). No Face ID prompt, so no usage string; the
        // Android backup rules keep the token out of Auto Backup, as a restored copy cannot be
        // decrypted on another device.
        "expo-secure-store",
        { faceIDPermission: false },
      ],
      [
        // The native splash is the launch screen's redFill (DESIGN.md), light
        // and dark, so start-up shows no cream flash before the red launch screen.
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#C8102E",
          dark: {
            backgroundColor: "#B5142F",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "06baf601-4306-4bd9-94f9-ca695cccb80b",
      },
    },
  },
};
