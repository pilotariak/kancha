# How to regenerate the icons

The app icons, the web icons and the splash image are PNG files generated from the SVG files in
`assets/`. Each SVG draws Errebote, the Kancha mark (`DESIGN.md`, App icon and logo), from the
same 1024 × 1024 drawing: `icon-square.svg` is the reference, the others recolor it, scale it
about the centre or cut it out. Regenerate the PNG files after a change to any of them.

## Prerequisites

- `rsvg-convert` (librsvg) renders the SVG files.
- `magick` (ImageMagick 7) flattens or keeps the alpha channel and writes the PNG file.

On macOS: `brew install librsvg imagemagick`. Neither is a dependency of the project.

## Sources and outputs

| Source                       | Output                               | Size | Background  | Use                                     |
| ---------------------------- | ------------------------------------ | ---- | ----------- | --------------------------------------- |
| `assets/icon-square.svg`     | `assets/images/icon.png`             | 1024 | red         | App icon (`icon`, `ios.icon.light`)     |
| `assets/icon-square.svg`     | `public/apple-touch-icon.png`        | 180  | red         | iOS home screen (web)                   |
| `assets/icon-square.svg`     | `public/icons/icon-192.png`          | 192  | red         | Manifest, purpose `any`                 |
| `assets/icon-square.svg`     | `public/icons/icon-512.png`          | 512  | red         | Manifest, purpose `any`, link preview   |
| `assets/icon-maskable.svg`   | `public/icons/icon-maskable-512.png` | 512  | red         | Manifest, purpose `maskable`            |
| `assets/icon-tinted.svg`     | `assets/images/icon-tinted.png`      | 1024 | black       | iOS 18 tinted icon (`ios.icon.tinted`)  |
| `assets/icon-dark.svg`       | `assets/images/icon-dark.png`        | 1024 | transparent | iOS 18 dark icon (`ios.icon.dark`)      |
| `assets/icon-adaptive.svg`   | `assets/images/adaptive-icon.png`    | 1024 | transparent | Android adaptive icon, foreground layer |
| `assets/icon-monochrome.svg` | `assets/images/icon-monochrome.png`  | 1024 | transparent | Android themed icon (monochrome layer)  |
| `assets/splash.svg`          | `assets/images/splash-icon.png`      | 1024 | transparent | Native splash image, launch screen      |
| `assets/icon.svg`            | `assets/images/favicon.png`          | 512  | transparent | Browser tab (`web.favicon`)             |

- `icon-square.svg` is the cream mark on a full-bleed red square: a home screen rounds the corners
  itself.
- `icon-maskable.svg` scales the mark by 0.8 so it stays inside the maskable safe zone, a centred
  circle with a radius of 40% of the icon size.
- `icon-adaptive.svg` and `icon-monochrome.svg` scale the mark by 0.72 so it stays inside the
  66 dp safe zone of the 108 dp layer. `app.config.js` puts the adaptive foreground on
  `android.adaptiveIcon.backgroundColor`, the same red.
- `icon-dark.svg` draws the mark in the dark palette's red on transparency, which iOS fills with
  its dark backdrop. `icon-tinted.svg` draws it in white on black: iOS tints that grayscale image.
- `splash.svg` is the cream mark alone, unscaled: the native splash draws it on the redFill of
  `app.config.js`, and the launch screen on the same redFill.
- `icon.svg` is the round logo: the cream mark on a red disc. Its transparent corners are fine at
  tab size. At export, Expo turns `favicon.png` into `dist/favicon.ico` (16, 32 and 48 px) and adds
  the `<link rel="icon">` itself.

Each SVG's comment gives its use and the safe-zone computation behind its scale.

## Generate the PNG files

From the repository root:

```bash
# Opaque: flattened on the background of the SVG, written as RGB
rsvg-convert -w 1024 -h 1024 assets/icon-square.svg \
  | magick png:- -background '#C8102E' -alpha remove -alpha off -strip PNG24:assets/images/icon.png
for size in 192 512; do
  rsvg-convert -w "$size" -h "$size" assets/icon-square.svg \
    | magick png:- -background '#C8102E' -alpha remove -alpha off -strip "PNG24:public/icons/icon-$size.png"
done
rsvg-convert -w 180 -h 180 assets/icon-square.svg \
  | magick png:- -background '#C8102E' -alpha remove -alpha off -strip PNG24:public/apple-touch-icon.png
rsvg-convert -w 512 -h 512 assets/icon-maskable.svg \
  | magick png:- -background '#C8102E' -alpha remove -alpha off -strip PNG24:public/icons/icon-maskable-512.png
rsvg-convert -w 1024 -h 1024 assets/icon-tinted.svg \
  | magick png:- -background '#000000' -alpha remove -alpha off -strip PNG24:assets/images/icon-tinted.png

# Transparent: the alpha channel is kept, written as RGBA
rsvg-convert -w 1024 -h 1024 assets/icon-dark.svg \
  | magick png:- -strip PNG32:assets/images/icon-dark.png
rsvg-convert -w 1024 -h 1024 assets/icon-adaptive.svg \
  | magick png:- -strip PNG32:assets/images/adaptive-icon.png
rsvg-convert -w 1024 -h 1024 assets/icon-monochrome.svg \
  | magick png:- -strip PNG32:assets/images/icon-monochrome.png
rsvg-convert -w 1024 -h 1024 assets/splash.svg \
  | magick png:- -strip PNG32:assets/images/splash-icon.png
rsvg-convert -w 512 -h 512 assets/icon.svg \
  | magick png:- -strip PNG32:assets/images/favicon.png
```

- `rsvg-convert` always writes an alpha channel. For the opaque icons, `magick` flattens the image
  on its background and writes it as RGB, because iOS paints transparent pixels of a home screen
  icon black.
- `PNG24:` and `PNG32:` force RGB and RGBA. Without them, ImageMagick writes a white mark on black
  or on transparency as a grayscale PNG.
- `-strip` drops the timestamps ImageMagick writes, so the same SVG gives the same PNG.

## Check the result

```bash
magick identify -format '%f %wx%h %[channels] %[pixel:p{0,0}]\n' \
  assets/images/icon.png assets/images/icon-tinted.png public/apple-touch-icon.png public/icons/*.png \
  assets/images/icon-dark.png assets/images/adaptive-icon.png assets/images/icon-monochrome.png \
  assets/images/splash-icon.png assets/images/favicon.png
```

- `icon.png`, `icon-tinted.png`, `apple-touch-icon.png` and `public/icons/*.png` must show their
  size and `srgb`, not `srgba`.
- `icon-dark.png`, `adaptive-icon.png`, `icon-monochrome.png`, `splash-icon.png` and
  `favicon.png` must show `srgba` and a transparent corner, `srgba(0,0,0,0)`.
- Keep `icon-512.png` at 512 × 512: `src/app/+html.tsx` declares that size for the link preview
  image.

The native files (`ios/`, `android/`) are generated from these PNG files by `bunx expo prebuild`
and are not committed.
