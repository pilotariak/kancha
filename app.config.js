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
      supportsTablet: false,
      bundleIdentifier: "io.pilotariak.kancha",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F7F4EF",
      },
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
      "expo-font",
      "expo-web-browser",
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
