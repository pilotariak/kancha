// react-native-view-shot's web module (src/RNViewShot.web.js, html2canvas), which ships no types.
// share-image.web.ts calls it directly: see there why.
declare module "react-native-view-shot/src/RNViewShot.web" {
  interface WebCaptureOptions {
    format: "png" | "jpg";
    result: "data-uri" | "base64";
    width?: number;
    height?: number;
    quality?: number;
  }

  const RNViewShot: {
    captureRef(view: HTMLElement, options: WebCaptureOptions): Promise<string>;
  };
  export default RNViewShot;
}
