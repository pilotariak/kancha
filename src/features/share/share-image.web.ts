import type { View } from "react-native";

import { CARD_SIZE } from "./share-card";

/**
 * Captures the card as a PNG, then shares it where the browser shares files, else downloads
 * it. A cancelled share resolves.
 *
 * view-shot's `captureRef` reads the view through `findNodeHandle`, which react-native-web 0.21
 * throws on, so the card's DOM node goes straight to view-shot's web module (html2canvas). It
 * loads on the first share only. html2canvas draws at the device pixel ratio, the ratio the
 * card was laid out for, so the resize to the card size is at most a pixel.
 */
export async function shareCardImage(view: View, fileName: string, _title: string): Promise<void> {
  const { default: viewShot } = await import("react-native-view-shot/src/RNViewShot.web");
  const dataUri = await viewShot.captureRef(view as unknown as HTMLElement, {
    format: "png",
    result: "data-uri",
    width: CARD_SIZE.width,
    height: CARD_SIZE.height,
  });
  const blob = await (await fetch(dataUri)).blob();
  const file = new File([blob], `${fileName}.png`, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      // The file alone: the link is in the image, and some browsers drop files given a url.
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // Safari refuses once the capture has used up the click's user activation: download.
      if (!(error instanceof DOMException && error.name === "NotAllowedError")) throw error;
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Let the download start before the blob goes.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
