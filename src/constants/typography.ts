import { Platform, type TextStyle } from "react-native";

/**
 * Barlow Condensed (SIL Open Font License, assets/fonts/OFL.txt), the scoreboard face of set
 * scores, bracket points, ranks and records, and the match mode score. All other text keeps the
 * system font. Each weight is a family of its own, under the name of its TTF file and its
 * PostScript name: Android loads it by file name, iOS by PostScript name, web by the `useFonts`
 * key in src/app/_layout.tsx.
 */
export const ScoreFont = {
  bold: "BarlowCondensed-Bold",
  black: "BarlowCondensed-Black",
} as const;

// On web, the system font stands in until the face has loaded, rather than the browser's serif.
const family = (name: string) => Platform.select({ web: `${name}, System`, default: name });

/**
 * Digit styles, with tabular figures so a score keeps its column from 9 to 10. Black for what a
 * system weight of 800 or more marked, Bold for the rest. Never add a fontWeight: the family is
 * the weight. A bold fontWeight makes Android look for "<family>_bold.ttf" and fall back to the
 * system font, and web fake a bolder face, as its @font-face rules declare no weight.
 */
export const scoreDigits = {
  bold: { fontFamily: family(ScoreFont.bold), fontVariant: ["tabular-nums"] },
  black: { fontFamily: family(ScoreFont.black), fontVariant: ["tabular-nums"] },
} satisfies Record<string, TextStyle>;

/** The tabular digit advance of the Black face, 540/1000 em: the wider of the two (Bold: 498). */
const DIGIT_EM = 0.54;

/** The width two digits take at `fontSize` in either face: a score column that fits 9 and 10. */
export function scoreColumnWidth(fontSize: number): number {
  return Math.ceil(2 * DIGIT_EM * fontSize);
}
