import * as Sharing from "expo-sharing";
import { PixelRatio, Platform, type View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { CARD_SIZE } from "./share-card";

/**
 * Captures the card as a PNG and opens the system share sheet with it (stories, messages,
 * saving to photos). Closing the sheet without sharing resolves too.
 *
 * The capture size is in points on iOS, drawn at the screen scale, and in pixels on Android.
 * The temporary file stays: the app that receives it may read it after the sheet closes, and
 * view-shot's temporary files go when the app closes.
 */
export async function shareCardImage(view: View, fileName: string, title: string): Promise<void> {
  const scale = Platform.OS === "ios" ? PixelRatio.get() : 1;
  const uri = await captureRef(view, {
    format: "png",
    result: "tmpfile",
    width: CARD_SIZE.width / scale,
    height: CARD_SIZE.height / scale,
    fileName,
  });
  // iOS returns a path, Android a file:// URL.
  await Sharing.shareAsync(uri.startsWith("file://") ? uri : `file://${uri}`, {
    mimeType: "image/png",
    UTI: "public.png",
    dialogTitle: title,
  });
}
