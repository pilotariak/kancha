import { hydrationI18n } from "@/i18n";

import { ScrollViewStyleReset } from "expo-router/html";
import React, { type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { KanchaColorsDark, KanchaColorsLight } from "@/constants/colors";
import { SITE_URL } from "@/constants/site";
import { APP_NAME } from "@/features/document-head/screen-title";

// Link previews are fetched by crawlers that run no JavaScript and need an absolute image URL.
const SHARE_IMAGE = `${SITE_URL}/icons/icon-512.png`;

/**
 * HTML shell of every page in the static web export, rendered in Node at build
 * time (no DOM). It reads the English `hydrationI18n`, like the screens in the
 * static HTML, so `lang` and the description match the page content whatever
 * the build machine's locale. The page `<title>` comes from `WebDocumentHead`:
 * the static renderer always injects the `Head` title first, so a `<title>`
 * here would be a second, ignored one.
 */
export default function Root({ children }: PropsWithChildren) {
  const { t, i18n } = useTranslation(undefined, { i18n: hydrationI18n });
  const description = t("head.description");

  return (
    <html lang={i18n.resolvedLanguage ?? "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={description} />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={KanchaColorsLight.cream}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={KanchaColorsDark.cream}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={SHARE_IMAGE} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={APP_NAME} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={SHARE_IMAGE} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
