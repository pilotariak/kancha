const { version } = require("./package.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Kancha",
    slug: "kancha",
    version,
    orientation: "portrait",
    // The icons draw the Errebote mark (DESIGN.md, App icon and logo), each PNG generated from
    // its SVG in assets/ (docs/how-to/howto-icons.md). icon.png is the cream mark on a full-bleed
    // red square (assets/icon-square.svg).
    icon: "./assets/images/icon.png",
    scheme: "kancha",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      // iOS 18 home screen appearances, both the mark of icon.png recolored. Apple asks for a
      // dark icon on a transparent background, which the system fills: here the mark in the
      // dark palette's red (assets/icon-dark.svg). The tinted icon is a grayscale image: here
      // the white mark on opaque black (assets/icon-tinted.svg), as Expo fills a tinted icon's
      // transparency with white. `light` must be set, or the dark image becomes the default
      // icon.
      icon: {
        light: "./assets/images/icon.png",
        dark: "./assets/images/icon-dark.png",
        tinted: "./assets/images/icon-tinted.png",
      },
      supportsTablet: false,
      bundleIdentifier: "io.pilotariak.kancha",
      // Universal links: the slot links of the website open the app (#158). The domain serves
      // public/.well-known/apple-app-site-association, which names the app by its Team ID.
      associatedDomains: ["applinks:kancha.pilotariak.com"],
    },
    android: {
      adaptiveIcon: {
        // The cream mark on a transparent background, inside the 66 dp safe zone
        // (assets/icon-adaptive.svg), over the red of icon.png.
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#C8102E",
        // Themed icons (Android 13 and up): the white mark on a transparent background, inside
        // the 66 dp safe zone (assets/icon-monochrome.svg). The launcher tints it;
        // icon-tinted.png is opaque and cannot serve here.
        monochromeImage: "./assets/images/icon-monochrome.png",
      },
      // Off, which writes android:enableOnBackInvokedCallback="false": React Native's
      // ReactActivity keeps an OnBackPressedCallback enabled at all times, so the system plays
      // no back preview, and react-native-screens 4.16 has no predictive back for its stack.
      predictiveBackGestureEnabled: false,
      package: "io.pilotariak.kancha",
      // App Links: the slot links of the website open the app (#158), verified against
      // public/.well-known/assetlinks.json. Only these paths: any other page of the site stays
      // in the browser.
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: ["/slot/join", "/slot/me", "/slot/recover"].map((path) => ({
            scheme: "https",
            host: "kancha.pilotariak.com",
            path,
          })),
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
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
        // The image is the cream mark on transparency (assets/splash.svg), which the
        // launch screen also draws. Android 12 and up keeps a circle 192 dp across of
        // the image drawn 200 dp wide: the mark fits, keep imageWidth at 200.
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
