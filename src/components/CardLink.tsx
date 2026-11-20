import * as Clipboard from "expo-clipboard";
import { type Href, Link, router } from "expo-router";
import React, { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Share, StyleSheet } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { shareUrl } from "@/features/links/share-url";

type CardLinkProps = Omit<ComponentProps<typeof PressableScale>, "onPress"> & {
  /** A path: the iOS preview renders `href.toString()`, and Share needs a URL. */
  href: Extract<Href, string>;
};

/**
 * A `PressableScale` card that opens `href`. On iOS, a long press also shows a preview of the
 * screen and a menu: Open, Share, Copy link, with the public web address (`shareUrl`). Android
 * and web keep the plain card: a press pushes `href`, and web keeps its hover and focus.
 */
export function CardLink({ href, style, ...props }: CardLinkProps) {
  const { t } = useTranslation();

  if (Platform.OS !== "ios") {
    return <PressableScale {...props} style={style} onPress={() => router.push(href)} />;
  }

  const url = shareUrl(href);
  // The Link hands its press handler to the card through Radix's Slot, which spreads the card's
  // style into an object: an array style would lose its entries, so it is flattened.
  return (
    <Link href={href} push asChild>
      <Link.Trigger>
        <PressableScale {...props} style={StyleSheet.flatten(style)} />
      </Link.Trigger>
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction
          title={t("link.open")}
          icon="arrow.up.forward.app"
          onPress={() => router.push(href)}
        />
        <Link.MenuAction
          title={t("link.share")}
          icon="square.and.arrow.up"
          onPress={() => {
            Share.share({ url }).catch(() => undefined);
          }}
        />
        <Link.MenuAction
          title={t("link.copy")}
          icon="doc.on.doc"
          onPress={() => {
            Clipboard.setStringAsync(url).catch(() => undefined);
          }}
        />
      </Link.Menu>
    </Link>
  );
}
