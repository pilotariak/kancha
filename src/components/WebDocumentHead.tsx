import { useSegments } from "expo-router";
import Head from "expo-router/head";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { APP_NAME, screenTitleKey } from "@/features/document-head/screen-title";

/**
 * Keeps the web document in step with the app: the tab title names the current
 * screen and `<html lang>` follows the language picker. Expo Router turns off
 * React Navigation's document title, so the screen `title` option never reaches
 * the browser; `Head` does, both at runtime and in the static export.
 */
export function WebDocumentHead() {
  const { t, i18n } = useTranslation();
  const segments = useSegments();
  const lang = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // On iOS builds with the ExpoHead module, Head registers Handoff activities and
  // fails without a router `origin`. This component only serves the web document.
  if (Platform.OS !== "web") {
    return null;
  }

  const key = screenTitleKey(segments);
  const title = key ? t("head.page_title", { screen: t(key) }) : APP_NAME;

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
