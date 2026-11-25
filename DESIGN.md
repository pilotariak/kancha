---
# ─────────────────────────────────────────────────────────────────────────────
# Machine-readable design tokens. Source of truth mirrors src/constants/colors.ts.
# Human-readable rationale lives in the markdown body below.
# Edit here, then run `make tokens` to regenerate src/constants/colors.ts.
# ─────────────────────────────────────────────────────────────────────────────

meta:
  name: "Kancha Mobile App"
  description: "Pelota basque tournament manager — warm cream canvas, Basque red identity, card-based clarity."
  platform: "native"
  colorScheme: "light"
  # cssExtras — non-schema token values generated into src/constants/colors.ts.
  # These are translucent/compound values (rgba) that fall outside the design.md
  # color schema but still need a single source of truth. Ignored by the linter.
  cssExtras:
    shadow: "rgba(103, 18, 31, 0.14)"
    on-red-strong: "rgba(255,255,255,0.90)"
    on-red-soft: "rgba(255,255,255,0.86)"
    ripple: "rgba(200,16,46,0.10)"
    ripple-on-red: "rgba(255,255,255,0.10)"
  # darkColors — full "Ikurriña" dark palette: very dark forest-green surfaces,
  # Basque red and white text, the three colors of the Basque flag. The
  # design.md standard is single-scheme, so the dark variant lives here (every
  # Palette field, keyed by its TypeScript name). Ignored by the linter; read by
  # hack/gen-design-tokens.py.
  darkColors:
    red: "#F5586E"
    redFill: "#B5142F"
    redDark: "#6E0C1E"
    redSoft: "#36141B"
    white: "#1A2922"
    cream: "#0B1411"
    ink: "#F3F7F4"
    text: "#DCE6E0"
    muted: "#97A89F"
    placeholder: "#97A89F"
    line: "#25362E"
    lineStrong: "#3B5246"
    card: "#13201A"
    panel: "#1E2E26"
    green: "#3CC489"
    greenSoft: "#12352A"
    shadow: "rgba(0, 8, 4, 0.50)"
    amber: "#E9AC2A"
    amberBg: "#2A240F"
    onRedStrong: "rgba(255,255,255,0.90)"
    onRedSoft: "rgba(255,255,255,0.80)"
    ripple: "rgba(245,88,110,0.10)"
    rippleOnRed: "rgba(255,255,255,0.10)"
    tabBar: "#0F1A15"
    tabBarBorder: "#1F2D27"
    tabIconInactive: "#5E7268"

# Light palette — the original Kancha identity (cream canvas, Basque red).
# Standard design.md color keys carry the light hex values; translucent values
# live in meta.cssExtras above. The linter may flag unreferenced colors as
# "defined but never used by a component" — expected and accepted.
colors:
  primary: "#C8102E"           # Basque Red — brand anchor, CTAs, hero, scores
  brand: "#C8102E"             # Basque Red — alias of primary
  brandFill: "#C8102E"         # Basque Red Fill — red surfaces under white text (header band, score panel, buttons)
  brandDark: "#970D25"         # Fronton Dark Red — pressed, error text
  brandSoft: "#FDE8EC"         # Blush Soft Red — error backgrounds, score chips
  background: "#F7F4EF"        # Warm Limestone Cream — screen canvas (never white)
  surface: "#FFFDFC"           # Pearl Card White — list cards
  surfaceElevated: "#FFFFFF"   # Pure White — match cards, modals, insets
  border: "#E5DED6"            # Warm Greige Line — universal border/divider
  borderStrong: "#CBBFB2"      # Strong Greige Line — hovered card, chip and field borders (web)
  textPrimary: "#141414"       # Deep Ink — headings, titles
  text: "#262626"              # Charcoal Text — body copy
  textMuted: "#7A7A7A"         # Warm Muted Gray — metadata, eyebrows
  textPlaceholder: "#6E6E6E"   # Placeholder Gray — input placeholders, 5.1:1 on white
  success: "#1F7A5A"           # Tournament Green — live/success/today
  successSoft: "#E6F4EE"       # Tournament Green Soft — success pill bg
  championship: "#C8900A"      # Championship Amber — finals/trophy highlights
  championshipSoft: "#FFF8E7"  # Championship Amber Soft — amber pill bg
  panel: "#1E1E1E"             # Panel Dark — dark inset surfaces on red cards
  tabBar: "#FFFFFF"            # Tab bar surface
  tabBarBorder: "#E9E0D6"      # Tab bar top border
  tabIconInactive: "#B8B1AA"   # Inactive tab icon tint
  error: "#C8102E"             # alias of primary
  info: "#1F7A5A"              # alias of success

typography:
  screenTitle:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0px"
  heroTitle:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0px"
  sectionTitle:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.8px"
  cardTitle:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0px"
  cardSubtitle:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0px"
  body:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0px"
  bodyStrong:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0px"
  meta:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "0px"
  metaStrong:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: "0px"
  eyebrow:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "1.5px"
  scoreLarge:
    fontFamily: "Barlow Condensed, System, -apple-system, Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: "0px"
  score:
    fontFamily: "Barlow Condensed, System, -apple-system, Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: "0px"
  scorePending:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: "0px"
  phaseChip:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
  pill:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0px"
  roundDivider:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.8px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "20px"
  "2xl": "22px"
  "3xl": "24px"
  hero: "120px"

rounded:
  icon: "12px"
  chip: "16px"
  round: "20px"
  hero: "24px"
  pill: "9999px"

# Resting (default-state) component tokens. Interactive states — pressed, error,
# disabled — plus borders, shadows and pill variants are documented in §4
# (Component Stylings) and §6 (Depth & Elevation) of the body.
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surfaceElevated}"
    typography: "{typography.bodyStrong}"
    rounded: "{rounded.round}"
    padding: "14px 20px"
  buttonDark:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.surfaceElevated}"
    typography: "{typography.bodyStrong}"
    rounded: "{rounded.icon}"
    padding: "14px 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.round}"
    padding: "18px"
  cardFeatured:
    backgroundColor: "{colors.brandFill}"
    textColor: "{colors.surfaceElevated}"
    rounded: "{rounded.hero}"
    padding: "22px"
  matchCard:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.chip}"
    padding: "14px"
  statusPill:
    backgroundColor: "{colors.successSoft}"
    textColor: "{colors.success}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
  selectField:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.bodyStrong}"
    rounded: "{rounded.chip}"
    padding: "0 16px"
  filterChip:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
  filterChipSelected:
    backgroundColor: "{colors.textPrimary}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
  segmentedControl:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "3px"
  segmentedControlActive:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
  errorState:
    backgroundColor: "{colors.brandSoft}"
    textColor: "{colors.brandDark}"
    typography: "{typography.meta}"
    rounded: "{rounded.chip}"
    padding: "16px"
  emptyState:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textMuted}"
    typography: "{typography.meta}"
    rounded: "{rounded.chip}"
    padding: "20px"
  textField:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.chip}"
    padding: "16px 18px"
  textFieldPlaceholder:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPlaceholder}"
    rounded: "{rounded.chip}"
    padding: "16px 18px"
---

# Design System — Kancha Mobile App

> Pelota basque tournament manager. Warm cream canvas, Basque red identity, card-based clarity.

---

## 1. Visual Theme & Atmosphere

**Mood:** Disciplined and warm. Kancha feels like a well-run sports federation — authoritative but approachable. The UI evokes the materiality of a pelota fronton: cream stone, deep red banners, crisp white lines.

**Core philosophy:**

- A **cream white canvas** (`#F7F4EF`) grounds every screen — never pure white, never cold.
- A **Basque red** (`#C8102E`) is the single dominant brand color. It drives the header band, primary actions, and featured content. It earns every pixel it occupies.
- **Dark ink** (`#141414`) for headings and body text. Near-black, not pure black — warm and legible.
- **Elevation through cards**, not shadows alone. White or cream cards on a cream background are separated by a warm `line` border (`#E5DED6`).
- The top of every screen is a **solid red header band** (`redFill`), sized by its content, with 24 px bottom corners. Only the screen header sits on it, in white; everything below it sits on cream. No gradient, so no text ever lands on a half-red, half-cream background.

**Key characteristics:**

- Mobile-first. 20 px horizontal gutters, 24 px card radii, generous touch targets (min 44 pt).
- **No decorative imagery** — the typography and color do all the expressive work.
- **Phase-driven layouts**: header band (solid red) → section header (cream) → card list (cream).
- Rounded, confident geometry. No sharp corners below 12 px radius.

---

## 2. Color Palette & Roles

### Brand & Primary

- **Red** (`#C8102E`): Primary brand color. Red text and icons (scores, errors, active tab indicator). Use at full opacity only — never tint arbitrarily.
- **Red Fill** (`#C8102E`): Red surfaces that carry white text or icons — the screen header band, hero cards, the score panel, CTA buttons. Same value as Red in light; in dark it stays deep so white text keeps 4.5:1 while Red brightens for text on dark surfaces.
- **Red Dark** (`#970D25`): Darker red for pressed states and error text on light surfaces.
- **Red Soft** (`#FDE8EC`): Light pink tint for error state backgrounds, score badge chips on light cards.

### Canvas & Surfaces

- **Cream** (`#F7F4EF`): Default page/screen background. Warm off-white — never substitute with `#FFFFFF`.
- **Card** (`#FFFDFC`): Slightly warmer than cream; used for list cards sitting on cream to create a 1-step elevation.
- **White** (`#FFFFFF`): Match cards, modal surfaces, high-contrast inset content.
- **Line** (`#E5DED6`): Border and divider color. Warm greige — matches the cream family.
- **Line Strong** (`#CBBFB2`, `#3B5246` dark): the border of a hovered card, chip or field on web, and the hover tint of an inactive segment. A step darker than Line in light, a step lighter in dark.

### Ink & Text

- **Ink** (`#141414`): Headings, card titles, primary body text on light backgrounds.
- **Text** (`#262626`): Body text, slightly softer than Ink.
- **Muted** (`#7A7A7A`): Secondary text, eyebrow labels, metadata.
- **Placeholder** (`#6E6E6E`): Placeholder text in input fields, and the gray text of the grouped list (§4 Grouped List). Darker than Muted so it reaches 4.5:1 on White (5.1:1) and on Cream (4.65:1); `#97A89F` in the dark theme (6.1:1 on the dark White).

### Semantic

- **Green** (`#1F7A5A`): Success states, "today" date pills, confirmed status.
- **Green Soft** (`#E6F4EE`): Success pill background.
- **Shadow** (`rgba(103, 18, 31, 0.14)`): Elevation shadow — red-tinted for brand warmth.
- **Ripple** (`rgba(200,16,46,0.10)`, the dark Red at 10 % in dark): the Android press ripple of cards, rows and tabs.
- **Ripple on Red** (`rgba(255,255,255,0.10)`): the ripple of a redFill card, where Red would not show.

### Dark Surfaces (panels, hero overlays)

- **Panel** (`#1E1E1E`): Dark inset surfaces within red hero cards (e.g. year/level badge).
- `#161616`: Alternate deep dark — used for featured info chips inside red cards.

### Dark theme — Ikurriña

The dark palette (`meta.darkColors`) takes the three colors of the Basque flag: very dark forest-green surfaces, Basque red, white text.

- **Canvas** (`#0B1411`), **Card** (`#13201A`), **White** (`#1A2922`): three green-black steps, from screen background to elevated match cards.
- **Red** (`#F5586E`): lifted so red text, scores and pills reach 4.5:1 on every dark surface.
- **Red Fill** (`#B5142F`): deep red for surfaces under white text — the header band, the score panel and red buttons stay at 4.5:1 or more.
- **Panel** (`#1E2E26`): the dark score panel, one step lighter than the cards.
- Every text pair meets WCAG AA (4.5:1); inactive tab icons meet 3:1.

### Reference table

| Role            | Value                  | Usage                          |
| --------------- | ---------------------- | ------------------------------ |
| `--red`         | `#C8102E`              | Brand, red text, scores, icons |
| `--red-fill`    | `#C8102E`              | Header band, CTAs, under white |
| `--red-dark`    | `#970D25`              | Pressed, error text            |
| `--red-soft`    | `#FDE8EC`              | Error bg, score chips          |
| `--cream`       | `#F7F4EF`              | Screen background              |
| `--card`        | `#FFFDFC`              | List card background           |
| `--white`       | `#FFFFFF`              | Match cards, modals            |
| `--line`        | `#E5DED6`              | Borders, dividers              |
| `--line-strong` | `#CBBFB2`              | Hovered borders (web)          |
| `--ink`         | `#141414`              | Headings, titles               |
| `--text`        | `#262626`              | Body text                      |
| `--muted`       | `#7A7A7A`              | Secondary text, metadata       |
| `--green`       | `#1F7A5A`              | Success, live/today indicator  |
| `--green-soft`  | `#E6F4EE`              | Success pill background        |
| `--shadow`      | `rgba(103,18,31,0.14)` | Elevated and hovered cards     |
| `--ripple`      | `rgba(200,16,46,0.10)` | Android press ripple           |
| `--panel`       | `#1E1E1E`              | Dark inset on red backgrounds  |
| `--amber`       | `#C8900A`              | Finale/final round highlight   |
| `--amber-bg`    | `#FFF8E7`              | Finale pill background         |

---

## 3. Typography Rules

**Font families:**

- **System default** (SF Pro on iOS, Roboto on Android) for all text but the scoreboard digits. The system font at high weights provides the sporty, confident tone needed.
- **Barlow Condensed** (SIL Open Font License, `assets/fonts/` with `OFL.txt`) for the scoreboard digits only: set scores and bracket points, rank numbers and records, the four figures of the player page (§4 Player page), the match mode score and its target. Like the scoreboards of frontons and trinquets, it reads from far away, and its narrow digits leave the team names more room.
  - Two faces: **Black** (900) where a system weight of 800 or more was (the winner's sets, ranks, records, the match mode score), **Bold** (700) for the rest (even and lost sets, the match mode target).
  - Always `tabular-nums`: Barlow's default figures are proportional. A tabular digit is 0.54 em in Black and 0.50 em in Bold, so a score column is two Black digits wide and 9 and 10 take the same place.
  - In code: `src/constants/typography.ts` (`ScoreFont`, `scoreDigits`, `scoreColumnWidth`). Each face is a family of its own, never set with `fontWeight`: Android would fall back to the system font and web would fake a bolder face.
  - Native builds embed the fonts (expo-font config plugin, `app.config.js`). Web loads them with `useFonts` in the root layout: the static pages declare and preload them, `font-display: swap`, the system font standing in until they load.
  - The share card keeps the system font: its web capture (html2canvas) may not see a web font.
- Other numeric data (years, counts) keeps the system font, with `tabular-nums` where numbers line up.

**Scale and hierarchy:**

| Role              | Size  | Weight | Line height | Letter spacing | Notes                                                      |
| ----------------- | ----- | ------ | ----------- | -------------- | ---------------------------------------------------------- |
| Screen title      | 34px  | 900    | 1.1         | 0              | Main hero title per screen                                 |
| Hero title (card) | 28px  | 900    | 1.1         | 0              | Featured card / detail hero                                |
| Section title     | 28px  | 800    | 1.15        | −0.8px         | Section header titles                                      |
| Card title        | 18px  | 800    | 1.2         | 0              | Competition/specialty cards                                |
| Card subtitle     | 17px  | 800    | 1.2         | 0              | Picker card labels                                         |
| Body              | 15px  | 400    | 1.4         | 0              | General readable text                                      |
| Body strong       | 15px  | 700    | 1.4         | 0              | Team names, links, footers                                 |
| Meta / secondary  | 14px  | 400    | 1.43        | 0              | Subtitles, hero sub                                        |
| Meta strong       | 14px  | 600    | 1.43        | 0              | Hero meta, card level text                                 |
| Eyebrow           | 12px  | 800    | 1.2         | +1.4–1.6px     | Section labels, always `uppercase`                         |
| Score (large)     | 28px  | 900    | 1.0         | 0              | Final match score, Barlow Condensed Black (Bold when lost) |
| Score (match)     | 112px | 900    | 1.0         | 0              | Match mode score, Barlow Condensed Black                   |
| Score target      | 28px  | 700    | —           | 0              | Match mode "/ 40", Barlow Condensed Bold                   |
| Score (normal)    | 22px  | 900    | 1.0         | 0              | Match score, Barlow Condensed Black (Bold when lost)       |
| Rank              | 15px  | 900    | 18px        | 0              | Ranking rank number, Barlow Condensed Black                |
| Record            | 20px  | 900    | 22px        | 0              | Ranking wins-losses, Barlow Condensed Black                |
| Score pending     | 20px  | 300    | 1.0         | 0              | "—" placeholder score, system font                         |
| Phase chip        | 12px  | 600    | 1.2         | 0              | Match phase label in footer                                |
| Pill label        | 12px  | 700    | 1.2         | 0              | Status pills                                               |
| Round divider     | 13px  | 800    | 1.2         | +0.8px         | Round section headers, `uppercase`                         |

**Principles:**

- Weight 900 ("Black") is reserved for titles only. Never use weight 900 on body text.
- Eyebrow text is always `uppercase` with generous letter-spacing (+1.2–1.6 px).
- All section-level headings use negative tracking (−0.8 px at 28 px) for density.
- Pending/empty states use weight 300 — intentionally light, to signal absence.
- Scoreboard digits take their weight from the Barlow Condensed face, never from `fontWeight`.

---

## 4. Component Stylings

### Buttons — Primary (Red)

```
Background:   #C8102E
Text:         #FFFFFF, 15px, weight 700
Border-radius: 20px
Padding:       14px 20px
Pressed:       scale(0.96) via PressableScale
Shadow:        rgba(103,18,31,0.14) 0 4px 16px
```

### Buttons — Dark (Icon/FAB)

```
Background:   #171717 or #1E1E1E
Text/Icon:    #FFFFFF
Border-radius: 18px (54×54 square FAB)
Usage:        Create/add action button in the header band's trailing slot
```

### Cards — Competition / Picker

```
Background:   #FFFDFC
Border:       1px solid #E5DED6
Border-radius: 20px
Padding:       18px
Shadow:        none at rest (border provides separation)
Title:         #141414, 17–18px, weight 800
Meta:          #7A7A7A, 13px, weight 400
Pressed:       scale(0.96) on iOS and web; on Android, a ripple clipped to the radius (below)
Hover (web):   lineStrong border, shadow 0 4px 16px (shadow token)
Focus (web):   2px solid red outline, 2px offset, keyboard focus only
```

### Cards — Icon Card

The first card of the competitions list, one cell in the grid, under the Suivis section when the
league has favourites (§ Follow — Suivis section): "Trouver un joueur", which opens the player
search.

```
Card:       a competition card (above), in a row: icon tile, text, trailing icon; 12px gap
Icon tile:  36 × 36px, redSoft, 12px radius, 18px red Search icon
Title:      #141414 (ink), 18px, weight 800
Subtitle:   #7A7A7A (muted), 13px, 2px below the title ("Titres, partenaires et classements par
            saison")
Trailing:   18px muted ChevronRight
```

### League Tile

`LeagueIcon` (`src/components/LeagueIcon.tsx`): the league's code, in front of its name on the
Leagues and About screens, and in the header band of the competitions list. Every league gets
the same tile: its letters tell it apart, not a color.

```
Tile:      44 × 44px, 12px radius (rounded.icon), redFill, code centered
Code:      #FFFFFF (the literal: the white token is dark green in dark), 15px, weight 800,
           +0.5px tracking. Text scaling capped at 1.3×, so "IDF" stays inside the tile
Muted:     a league Kancha does not cover yet (Béarn, Leagues screen only): line fill, code in
           text (#262626), not muted: muted on line is 3.2:1 in light
On band:   `onBand`, in the header band's trailing slot (competitions list): a 2px #FFFFFF ring,
           as a redFill tile has no edge on the redFill band. 44px fits beside the 34px title
Hidden:    aria-hidden. Screen readers read the full league name, from the card's label or the
           text beside the tile
Logo:      an official league logo, once a committee provides one, replaces the tile at the same
           size, stored in assets/. Never a remote image
```

Codes come from `League.code` (`src/constants/leagues.ts`): CA (lcapb), PB (ctpb), BÉ (cbp), LA
(llpb), IDF (lidfpb). They are proposals, still to be confirmed by each committee. Keep a code
precomposed (NFC): "BÉ" written as E + U+0301 can take its accent from a fallback font on web.

| Pair                                        | Light  | Dark (Ikurriña) |
| ------------------------------------------- | ------ | --------------- |
| Code (#FFFFFF) on redFill                   | 5.88:1 | 6.76:1          |
| Ring (#FFFFFF) on the band (redFill)        | 5.88:1 | 6.76:1          |
| Muted code (text) on line                   | 11.4:1 | 10.0:1          |
| Muted code (text) on line, in the 0.6 card  | 3.6:1  | 4.8:1           |
| Muted on line (rejected for the muted code) | 3.2:1  | 5.1:1           |

The Béarn card is disabled at 0.6 opacity over cream, which takes the muted code to 3.6:1 in
light. WCAG 1.4.3 exempts an inactive component.

### Interaction states (web)

Hover and keyboard focus exist on web only; iOS and Android have neither. The styles live in
`src/hooks/use-interaction-styles.ts` and read the `hovered` and `focused` states that
react-native-web passes to `Pressable`. Text fields take their focus style from `useFieldFocus`
in the same file.

```
Hover, cards and fields:  lineStrong border + shadow 0 4px 16px in the shadow token
                          (PressableScale cards, SelectField). A card without a border, such as
                          the featured card, gets the shadow only
Hover, chips:             lineStrong border, no shadow: the scrolling chip row would clip it.
                          A selected chip does not change
Hover, segments:          lineStrong fill on an inactive segment; the active one does not change
Hover, back link:         underlined label; redDark circle behind the collapsed bar's arrow
Focus ring:               2px solid red outline, 2px offset (rounded with the element). White,
                          with a 4px offset, for the back link on the red band (2px around the
                          collapsed bar's round back button)
Mouse focus:              no ring. A click also focuses a Pressable on web, so the ring only
                          shows when the browser matches :focus-visible (keyboard focus)
Focus, text fields:       a 2px red edge instead of the browser outline, after a click too:
                          typing goes to the field however it was focused (Inputs — Text Field)
```

`PressableScale` is an `Animated` component, which cannot take a style callback: it tracks hover
and focus through `onHoverIn`/`onHoverOut` and `onFocus`/`onBlur` instead. It draws the hover
only when it carries the card's `style`: a bare wrapper around a styled child has no radius for
the shadow to follow.

Press feedback, on every platform (`PressableScale`):

```
iOS and web:        scale(0.96), spring
Android, cards:     a ripple in the ripple token (red at 10 %) over the card, clipped to its
                    radius, and no scale. The featured card passes rippleOnRed (white at 10 %)
                    through `android_ripple`: red would not show on redFill
Android, wrappers:  scale(0.96), as on iOS: a bare wrapper around a styled child (chips, CTA
                    buttons) has no radius for the ripple to follow, and the child's fill would
                    hide a ripple drawn behind it
Android, tabs:      the ripple token (Navigation / Tab Bar)
```

React Native masks a bounded ripple with a rectangle, which would spill past a 20px corner. The
card draws it in the foreground (`foreground: true`) with `overflow: "hidden"`: React Native then
clips the foreground to the card's own rounded border, so the ripple follows any radius without
reading it.

### Link previews (iOS)

`CardLink` (`src/components/CardLink.tsx`) is the `PressableScale` of a card that opens a screen:
the competition cards, the featured card, the season tiles, the player rows and the club page
entries. A press opens the
screen on every platform. On iOS, a long press also shows the screen in a system preview, with a
menu: Open, Share, Copy link. Share and Copy link give the screen's public web address
(`SITE_URL`, `src/constants/site.ts`), which opens the web app: the app has no universal links.
Android and web keep the plain card: the ripple on Android, the hover and focus states on web.

### App icon and logo

Errebote, the Kancha mark: a heavy K cut like a scoreboard digit, whose open mouth catches the
ball (the rebound). One mark for the app icon, the web icons, the native splash, the launch screen
and the in-app logo. Its smallest feature is the ball, so it stays sharp at 16 px. The SVG
sources are in `assets/`, and the PNG files are generated from them
(`docs/how-to/howto-icons.md`).

```
Mark:          1024 viewBox (assets/icon-square.svg). Stem 168 × 632 at (232, 196), 20 radius;
               two arms 150 wide from the stem, cut flat level with its ends; the ball, radius
               96, at (716, 512) in the mouth. Farthest point from the centre: the stem's
               corner, 422 (414 once rounded)
Colors:        cream (#F7F4EF) mark on red (#C8102E): the light redFill, the red of the native
               splash and of the launch screen, so opening the app shows no change of color
```

App icon, from `app.config.js`:

```
iOS:           icon.png, the red tile, full bleed and opaque. iOS 18 dark: the mark in the dark
               palette's red (#F5586E) on transparency, which the system fills. iOS 18 tinted:
               the white mark on opaque black, which the system tints
Adaptive icon: Android, the cream mark (foregroundImage) on #C8102E (backgroundColor), scaled by
               0.72 about the centre to stay inside the 66 dp safe zone of the 108 dp layer
Themed icon:   monochromeImage, Android 13 and up: the white mark on a transparent background,
               which the launcher tints, scaled by 0.72 like the adaptive icon
Web:           the red tile for the iOS home screen and the manifest, the mark scaled by 0.8 for
               the maskable icon, the cream mark on a red disc for the browser tab (favicon)
```

`KanchaLogo` (`src/components/KanchaLogo.tsx`) draws the mark in the app, as a vector, in the
icon's 1024 viewBox: the mark has the same height in both variants, 62% of `size`. Its colors are
the brand's and do not follow the theme.

```
tile:          the red tile (#C8102E, corner radius 22.5% of its size), cream mark, `size`
               square. On cream, white or dark surfaces: the web rail (§ Navigation / Tab Bar),
               and the About screen, 52px in the 64px white box of its header
mark:          the cream mark alone, `size` high and only as wide as the mark (57% of `size`),
               so it lines up with the text beside and below it. On red surfaces: the band of
               the Share card
```

The launch screen (`src/components/launch-screen.tsx`, iOS and Android; web skips it) follows the
native splash:

```
Native splash: expo-splash-screen, redFill (#C8102E light, #B5142F dark), splash-icon.png (the
               cream mark on transparency) 200 wide in the middle. Android 12 and up keeps a
               circle 192 dp across of it: the mark fits
Launch screen: the same redFill and the same cream mark (splash-icon.png) at 112px, springing
               from 0.72 to 1 as it fades in, then "Kancha" (#FFFFFF 42px weight 900) and
               "Pilotariak" (onRedSoft 14px weight 700, uppercase, +6px tracking); the version at
               the bottom, onRedSoft 12px
```

### Cards — Featured / Hero Card

`FeaturedCard` (`src/components/FeaturedCard.tsx`): the one red card of a screen, for its main
content. The competitions list features the current season with it: eyebrow "Saison en cours",
the competition name, footer "Voir les résultats", and the whole card opens the results.

```
Background:   redFill (#C8102E light, #B5142F dark), never red: white on the dark red (#F5586E)
              is 3.2:1
Border-radius: 24px
Padding:       22px, 8px between eyebrow and title
Eyebrow:       onRedSoft, 12px, weight 800, uppercase, +1.5px tracking
Title:         #FFFFFF, 28px (Hero title), weight 900, line-height 31px. A season in the name
               never breaks: word joiners (U+2060) hold "2025-2026" on one line
Sub panel:     #161616 bg, #FFFFFF text — inset dark chip for metadata (optional)
Footer:        #FFFFFF 15px weight 700 + ChevronRight 18px #FFFFFF, space-between, 12px above
Pressed:       scale(0.96) via PressableScale on iOS and web; a rippleOnRed ripple on Android
Hover (web):   the shadow only (no border); focus ring as the other cards
Placement:     on cream, at least 22px below the header band. The band's 24px bottom corners
               and the cream gap keep the two red blocks apart in both themes; never let the
               card touch the band
```

Contrast is the header band's: white title and footer 5.88:1 (light) and 6.76:1 (dark), eyebrow
4.61:1 and 4.73:1.

### Season Grid

The previous seasons on the competitions list, under a "Saisons précédentes" section header.
The season comes from the competition name (`src/features/competitions/seasons.ts`), as Frontis
has no season field; a league with no season in any name keeps the plain list of competition
cards.

`SeasonTile` (`src/components/SeasonTile.tsx`): a half-width tile, two per row, 12px apart (on
web, two per grid column: half a card). Each tile fills a `flex: 1` cell without padding, and
empty cells fill a short last row, so every tile keeps the same width. Every tile opens the
results of one competition.

```
Tile:      #FFFDFC (card), 1px solid #E5DED6 (line), 20px radius, 16px padding, 8px gap. A
           season tile has 12px padding and no min height: with its years only, it is 52px high,
           about half the 98px it had with a two-line name. At 375px, the 12px sides leave 135px
           for the 129px of "2025-2026", which 16px cut to "2025-20…". Tiles of a row share its
           height
Eyebrow:   season tile only, and only when the name without its season differs from the
           featured competition's ("COMPÉTITION (EXT)" among lidfpb's "Compétition" seasons):
           #262626 (text), 12px, weight 800, uppercase, +1.2px tracking, up to 3 lines, at the
           top. Text, not muted: it names the competition, and muted on card is 4.2:1
Season:    #141414 (ink), 22px, weight 900, tabular-nums, one line ("2025-2026"), at the bottom
           (auto top margin): beside a tile with a name, the years of a row stay level
```

- **One competition per season**: one tile per season, with its years. The header band already
  names the league, and the featured card the competition, so a tile repeats neither: lcapb tiles
  show their years only. A name that differs from the featured competition's still shows above
  the years (`seasonTileName`): lidfpb's 2021-2022 "Compétition (Ext)" and 2017-2018
  "Championnat", lcapb's 2014-2016 "Championnat Hiver LCAPB" under "Toutes les saisons".
- **Several competitions in a season**: a season heading ("Saison 2025-2026": #141414, 13px,
  weight 800, uppercase, +0.8px tracking) and one tile per competition, with no eyebrow and the
  name without its season as title (#141414, 16px, weight 800, line-height 20px, up to 3 lines).
  In the current season, the first competition gets the featured card and the others a
  competition card right under it.
- **Six seasons**, then a toggle: "Toutes les saisons" with ChevronDown, "Moins de saisons" with
  ChevronUp once open. It counts seasons, not tiles. No toggle when nothing is hidden.
- **Names without a season** in a league that has seasons: competition cards under "Autres
  compétitions", after the grid.

```
Toggle:    full width, min height 44px, pill radius, #FFFFFF (white), 1px solid #E5DED6 (line),
           #141414 (ink) 15px weight 700 label + 18px chevron, 8px gap. Pressed: #E5DED6 (line).
           aria-expanded carries the state. No red: showing more is not an action. On web from
           two columns: one cell wide, centered under the tiles
```

| Pair                               | Light  | Dark (Ikurriña) |
| ---------------------------------- | ------ | --------------- |
| Tile season and name (ink) on card | 18.2:1 | 15.5:1          |
| Tile eyebrow (text) on card        | 14.9:1 | 13.2:1          |
| Toggle label (ink) on white        | 18.4:1 | 14.0:1          |

### Cards — Match Day Card

The list view groups each round's matches by match day (`groupByDay` in
`src/features/competitions/matchDays.ts`): one card per day, in date order, under the round
divider. Matches without a readable date come last, in a "Date à venir" card.

```
Background:   #FFFFFF once one of the day's matches has a score / #FFFDFC while all are to play
Border:       1px solid #E5DED6; Final round: 2px solid red
Border-radius: 16px
Gap:          10px between day cards, as between a round divider and its first card
Day header:   a button, min height 44px, 10px × 14px padding: the long date in full and
              capitalized ("Dimanche 13 septembre", Intl in the app's language), #141414 15px
              weight 800, then " · 3 parties" (details.matches_count) #7A7A7A 13px weight 600.
              Today: a green StatusPill after the text. ChevronDown 18px #7A7A7A on the right,
              turned up when open. A 1px #E5DED6 hairline under it when open
Collapsed:    the header alone, one line. Days before the most recent day with a score, across
              every round, start collapsed; that day, today, later days and "Date à venir" start
              open (all open before the first score). A press opens or closes a day; the choice
              lasts until the specialty or category changes
Motion:       opening fades the matches in and turns the chevron over (200ms); closing removes
              the matches at once. With reduce motion (`useReducedMotion`), both switch at once
Matches:      one row per match, split by full-width 1px #E5DED6 hairlines. Each match: its
              phase in words above the teams ("Poule 4": rounds_match.* label), #7A7A7A 12px
              weight 600 (amber #C8900A in the Final), then the team rows; 14px side padding,
              10px top, 6px bottom. No date on a match: the day header carries it
Share:        a match with a score ends its phase line with a Share button (§ Share card)
Team row:     8px top and bottom; 16px winner slot | name + club (flex 1) | one score column
              per set. The club name opens the club page (`ClubLink`, § Club page); a side
              without a lineup shows its club as its name, and that name is the link
Divider:      1px solid #E5DED6 between team rows
Sets:         one column per set ("07/15 04/15" → 7 4 against 15 15), Barlow Condensed (§3)
              22px (28px Final), right-aligned, two Black digits wide: min width 24px (31px
              Final), 12px apart, tabular-nums
Winner:       team that won more sets — green #1F7A5A Check (16px, stroke 3) in the slot,
              name #141414 weight 800, sets #141414 Black
Loser:        name #141414 weight 600, sets #7A7A7A Bold
No winner:    score missing or sets even — no Check, names #141414 weight 700, sets #141414
              Bold
Score pending: "—", #7A7A7A, 20px, weight 300
No red:       a regular day card carries no red. The Final keeps its amber round pill,
              amber phase label and 2px red border.
Bracket node: same team rows at 14px names, 17px sets (22px Final), min width 19px (24px
              Final), no header
Grid:         web, from two columns (§5 Columns): a day card spans the whole results column,
              like the round dividers, and lays its matches out as many to a row as the results
              have columns, each in a `flex: 1` cell split from the next by a 1px #E5DED6
              hairline. A match keeps a phone card's width, the days stay one under the other,
              and a short last row keeps empty cells
Interaction:  the day header, and the club names (§ Club page). Header pressed: cream fill.
              Web hover: the card takes the card hover (lineStrong border and shadow; the Final
              keeps its red border). Keyboard focus: the red ring inside the card (−2px offset),
              as the header is its top row. `aria-expanded` gives the state (accessibilityState
              is dropped on web); the accessible name is the date, "Aujourd'hui" on the day, and
              the count
```

**Current day strip.** Once a day header scrolls under the pinned filters (§ Screen Header,
collapsed), a strip under them repeats it: the day being read, with the header's text styles and
its Today pill.

```
Strip:        36px high, cream, 1px #E5DED6 bottom edge; text inset to the day header's text
Width:        full width on a phone and under the filter bar; beside the filter column, the
              results column only, so the sticky filters stay uncovered
Placement:    hangs under the pinned header (`PinnedHeader`'s `strip`), positioned on its own:
              it takes no room, so the results never move when it comes or goes
Current day:  the first day once its card's top reaches the pinned header's bottom edge, then
              each next day as its card's top reaches the strip's bottom edge, so the strip
              covers each header as it takes its place. Hidden above the first day, and in the
              bracket and ranking views
Behavior:     no touches (pointer-events none), hidden from screen readers: the day headers
              carry the same text
```

The day headers are not sticky headers of the scroll view: on iOS and Android, the next sticky
header pushes the previous one out (`ScrollViewStickyHeader`), and it would push the pinned
filters away. The strip follows the scroll offset and the measured top of each day card instead
(`measureLayout` against the results body, on every resize of that body), so it behaves the same
on iOS, Android and web.

On a phone, the bracket (`BracketView`) shows the knockout rounds first, in a row that scrolls
sideways and bleeds over the gutters, and folds the pools under it.

```
Knockout:   every round but the pools (barrages, 16ths to the final), in the order they are
            played, as columns connected by a 32px chevron. A column leaves 40px of the next one
            on the first screen: screen width − 20px gutter − 32px chevron − 40px, one card
            (350px) at most, 220px at least (298px on a 390px phone). A lone round is one card
            between the gutters. The nodes take their column's width
Snap:       the row snaps to a column (column + chevron); the end of the scroll shows the last
            round whole
Fade:       a 32px cream fade on the right edge, from transparent (cream at alpha 0, as gray
            shows through "transparent" on web) to cream, while more of the row is to the right
Dots:       with two rounds or more, one 6px dot per round under the row, centered, 6px apart:
            lineStrong, the round nearest the left edge 18px wide in ink. They follow the scroll,
            and the end of the scroll marks the last round. Hidden from screen readers: the
            round pills name the columns
Pools:      20px under the dots, inside the gutters: for each group round (pools, and phases the
            parser does not know), its round pill, then one summary line, collapsed
Summary:    "15 parties en 5 journées, du 6 septembre au 4 octobre" ("3 parties le 6 septembre"
            on one day, the match count alone with no date); white card, 1px #E5DED6 border, 14px
            radius, 44px high at least, 14px side padding; text #141414 14px weight 700, then a
            ChevronDown 18px muted, turned over when open. The days are the days with a readable
            date; a match without one counts as a match
Open:       the summary opens the pool's nodes as a column, 10px apart, at the width between the
            gutters. Pressed: cream fill. Web hover: the card hover. Keyboard focus: the red
            ring. `aria-expanded` gives the state
Pools only: a competition without knockout rounds keeps the row of round columns one card wide,
            with every match in view
```

From two columns (web, `columns` prop), the bracket takes the fit layout: nothing scrolls
sideways.

```
Knockout:  every round but the pools (barrages, 16ths to the final), side by side in one row,
           24px apart, no chevron. They share the width: 220px at least (names stay readable),
           one card (350px) at most; more rounds than fit wrap onto a new line. The nodes take
           their column's width
Pools:     below, 24px under the knockout row: the round pill, then the nodes in a CardGrid of
           the screen's columns, each filling its cell so a row shares its height. Phases the
           parser does not know ("Parties") go there too
```

The knockout rounds come first, at every width: they are what a reader looks for, and they are
short. Pools are not a knockout bracket, and their 15 to 25 matches as a column, nearly 2,000px
tall on a phone, left the later rounds empty and off screen.

### Status Pills

| Tone  | Background | Text      | Usage                  |
| ----- | ---------- | --------- | ---------------------- |
| red   | `#F9D8DE`  | `#970D25` | Warnings, forfeits     |
| green | `#E6F4EE`  | `#1F7A5A` | Today, live, confirmed |
| dark  | `#262626`  | `#FFFFFF` | Finals, completed      |
| soft  | `#EFE8DE`  | `#5D5145` | Neutral / upcoming     |
| amber | `#FFF3DC`  | `#8A5E00` | Semi-final, attention  |

Shape: `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`.
Small (`size="small"`, the phase in a ranking row): `padding: 2px 7px`, `font-size: 11px`,
`line-height: 14px`, one line.

A past date is not a warning: day cards show no pill for a played day, only the green "Today"
pill in the header of the day's card.

### Round Section Dividers

```
Line:          1px solid #E5DED6, flex: 1
Pill bg:       #F7F4EF (cream)
Pill border:   1px solid #E5DED6
Pill padding:  6px 14px
Border-radius: 20px
Label:         #141414, 13px, weight 800, uppercase, +0.8px tracking
Count:         #7A7A7A, 12px, weight 600

Final variant:
  Pill bg:     #FFF8E7
  Pill border: rgba(200,144,10,0.4)
  Label:       #A86E00
  Count:       #C8900A
  Icon:        Trophy (gold)
```

In the list view, a round's day cards follow its divider (Cards — Match Day Card); the count
stays the round's number of matches. The bracket keeps the rounds without days.

### Screen Header (red band)

`ScreenHeader` (`src/components/ScreenHeader.tsx`): the one header for every screen.

```
Background:   redFill, solid, full width, sized by its content
Corners:      24px bottom-left and bottom-right (rounded.hero), square top
Padding:      12px top, 20px sides, 24px bottom; 16px between back link and text
Back link:    optional, ArrowLeft 20px + label, #FFFFFF 15px weight 600
Eyebrow:      optional, onRedSoft, 12px, weight 800, uppercase, +1.5px tracking. Once per
              flow: the Leagues band has "Tableau des compétitions", the Competitions band
              under it does not repeat it
Title:        #FFFFFF, 34px, weight 900, line-height 37px, accessibilityRole "header"
Subtitle:     optional, onRedStrong, 14px, line-height 20px
Trailing:     optional slot right of the text, 16px gap (the About logo, an action button)
Action:       optional, at the right end of the back link's row, centered on it, 16px gap (the
              follow button). It stays out of the band's bottom 52px, which the collapsed bar
              overlaps on the results screen: a control there would lose its presses to the bar,
              invisible at rest, even where the title is one line
Loading:      white spinner in place of the title and subtitle
Compact:      `compact` prop, for a screen with filters under the band (results): title 28px
              (Hero title), line-height 31px; 16px bottom padding, 12px between back link and text
Width:        always full width. On a grid screen its content keeps the 20px gutter, like the
              grid below. A text screen passes its text column (`column` prop), and the
              band's content keeps to it
Back link:    hover underlines the label; keyboard focus draws a 2px white outline, 4px offset
              (a red ring would not show on the band)
```

**Collapsed** (`collapsed` prop): the bar a compact band collapses to while the results scroll.
The band itself scrolls away as on every screen; the bar pins at the top in its place, above the
filters.

```
Bar:          52px (BAR_HEIGHT), redFill, full width, the band's 24px bottom corners, so it
              fades in over the band without a seam. Cream behind the corners once pinned
Back button:  ArrowLeft 20px, #FFFFFF, in a 36px circle (hitSlop to 44px) centered where the
              band's arrow sits, 20px from the edge; accessible name: the back label
Title:        #FFFFFF, 17px (Card subtitle), weight 800, one line with an ellipsis, 8px after
              the button, 20px from the right edge. Not a header: the band's title is the
              screen's heading
Loading:      white spinner in place of the title
Hover, press: redDark circle behind the arrow
Focus (web):  2px white outline, 2px offset, keyboard focus only
Hidden:       `inert` until it shows: no touches, out of the tab order (tabIndex -1), hidden
              from screen readers (aria-hidden)
```

The bar's top 52px overlap the band's bottom, and it shows in two steps over the last 24px of
scroll before it pins (`scrollY` interpolation, native driver on iOS and Android): its fill first,
hiding the band's title, then its arrow and title, so the two titles never show over each other.
It takes touches, focus and screen readers from the second step. With "reduce motion" on (system
setting, or `prefers-reduced-motion` on web, read by `useReducedMotion` in
`src/hooks/use-reduced-motion.ts`), the bar switches from hidden to shown at that point, with no
fade.

| Pair (on redFill)                  | Light (`#C8102E`) | Dark (`#B5142F`) |
| ---------------------------------- | ----------------- | ---------------- |
| Title, back link (`#FFFFFF`)       | 5.88:1            | 6.76:1           |
| Subtitle (onRedStrong, 0.90 white) | 4.95:1            | 5.68:1           |
| Eyebrow (onRedSoft, 0.86 / 0.80)   | 4.61:1            | 4.73:1           |
| Bar arrow on its hover circle      | 8.75:1 (redDark)  | 12.11:1          |

### Section Header

`SectionHeader` (`src/components/SectionHeader.tsx`): section titles on cream, below the band.

```
Eyebrow:  #7A7A7A, 12px, weight 800, uppercase, +1.6px tracking
Title:    #141414, 28px, weight 800, −0.8px tracking
Subtitle: #7A7A7A, 14px, weight 400, line-height 20px
Gap:      4px between stack items
```

### Grouped List

`ListGroup` (`src/components/ListGroup.tsx`): rows grouped in one card under a heading, with a
line between rows, like an iOS inset grouped list. The About screen has two groups: Préférences
(Apparence, then Langue), then Application (Version, Site web, Copyright). The supported leagues
section follows, 32px below.

```
Heading:     placeholder (#6E6E6E), 12px, weight 800, uppercase, +1.4px tracking,
             accessibilityRole "header", 8px above the card
Card:        #FFFFFF (white), 1px solid #E5DED6 (line), 20px radius. It clips its rows
             (overflow hidden), so a pressed or selected fill follows its corners
Separator:   1px line between rows, inset 20px from the left (ROW_INSET), to the right edge
Row:         20px sides, 16px above and below, label left and value right, 12px apart
Label:       placeholder, 14px, weight 600; a picker's label follows a 16px muted icon, 8px gap
Value:       #141414 (ink), 15px, weight 700. The website is a link: red, with ExternalLink 14px
Pressed:     cream fill, also on web hover. No hover border or shadow: the row has no edge
Focus (web): the 2px red ring, drawn 2px inside the row (outlineOffset −2), as the card clips
             a ring drawn outside it. Keyboard focus only
```

**Picker row** (Apparence, Langue): the row opens its options below it, in the same card, and
its chevron turns up. Choosing an option closes them.

```
Row:         a button named after its label and value ("Langue, Français"), with aria-expanded
Options:     a radiogroup named after the row; each option a radio with aria-checked (not
             accessibilityState, which react-native-web drops)
Option:      14px above and below, 44px from the left (OPTION_INSET), under the row's label; a
             line inset 44px above each. #141414 15px, weight 600
Selected:    redSoft fill, red text weight 800, 8px red dot on the right
```

**Languages**: each language under its own name, never a flag, as a flag names a country and not
a language: English, Français, Español, Euskara. Its name in the interface language follows as
secondary text, in placeholder after a middle dot: "Euskara · Basque". The interface language
itself, which is the selected option, shows its name once. The own name is the language's key in
its own locale file (`t("language.eu", { lng: "eu" })`), so no name is written in code. Screen
readers read the visible names with a comma in place of the dot ("Euskara, Basque"), which starts
with the visible text. `languageNames` and `resolveLanguage` (`src/features/language/languages.ts`)
build the names and map the device language to a supported one ("fr-FR" is Français, an
unsupported language is English).

Muted falls short of 4.5:1 in light on both surfaces, so the gray text uses placeholder:

| Pair                                         | Light  | Dark (Ikurriña) |
| -------------------------------------------- | ------ | --------------- |
| Heading (placeholder) on cream               | 4.65:1 | 7.50:1          |
| Label, secondary name (placeholder) on white | 5.10:1 | 6.08:1          |
| Label on a pressed or hovered row (cream)    | 4.65:1 | 7.50:1          |
| Link (red) on white                          | 5.88:1 | 4.70:1          |
| Selected option (red) on redSoft             | 5.02:1 | 5.11:1          |
| Muted on white (rejected for labels)         | 4.29:1 | 6.08:1          |
| Muted on cream (rejected for headings)       | 3.91:1 | 7.50:1          |

### Navigation / Tab Bar

Expo Router tabs. iOS and Android use native tabs (`NativeTabs` from
`expo-router/unstable-native-tabs`, flagged unstable in SDK 54) in `src/app/(tabs)/_layout.tsx`;
web uses React Navigation's JS tabs in `src/app/(tabs)/_layout.web.tsx`, which Expo Router picks
over it on web only. Native tabs show only the routes that have a Trigger, so `index` and `slot`
are no tabs there; web hides them with `href: null`. Competitions is the first tab: a launch on
`/` lands on it.

iOS: the system tab bar, Liquid Glass on iOS 26.

```
Active tint:   red (tintColor), the only color set: a background, blur or label color would
               replace the system glass
Icons:         SF Symbols, outline at rest and filled when selected: trophy, sportscourt,
               info.circle (each with .fill)
Label:         the system's
Minimize:      the bar shrinks while a screen scrolls down (iOS 26, minimizeBehavior)
```

Android: the Material 3 bottom navigation, in the colors of the former JS bar.

```
Background:    tabBar
Active:        red icon and label on a redSoft pill (indicatorColor). react-native-screens
               draws the bar in a Material 3 theme with the active indicator on, so the pill
               needs only its color
Inactive tint: tabIconInactive
Ripple:        the ripple token (rippleColor). Without it, react-native-screens reads
               itemRippleColor from the Material 3 theme, which does not define it: no ripple
Label:         12px, weight 700
Icons:         Material Design Icons rendered to images by VectorIcon: trophy-outline,
               sword-cross, information-outline (`src/components/android-tab-icon.android.tsx`).
               Native tabs take an image or a drawable, not the Lucide SVG components. A
               drawable is an Android resource, which this managed project could only add
               through a config plugin; the images need none
```

Every color comes from the active palette, so the bar follows the app's theme in light and dark,
not only the system's.

Web: the bottom bar until two columns fit beside the rail (`RAIL_MIN_WIDTH`, 880px, §5).

```
Background:    #FFFFFF
Border top:    1px solid #E9E0D6
Active tint:   #C8102E
Inactive tint: #B8B1AA
Label:         12px, weight 700, paddingBottom 8px
```

From there, web shows a navigation rail on the left instead:

```
Rail:          128px wide (RAIL_WIDTH), full height, tabBar background, 1px tabBarBorder
               right border, 8px side padding. React Navigation's left tab bar, material variant
Logo:          KanchaLogo tile 48px, centered, 20px from the top, 16px above the tabs; the same
               red tile in both themes. Decorative: it sits on the tab bar's background layer
Tab:           24px icon above a 12px weight 700 label, 16px radius
Active:        red icon and label on a redSoft pill
Inactive:      text icon and label (not tabIconInactive: the labels need 4.5:1)
Hover:         React Navigation's overlay (8% of its theme text color): visible in light, faint
               in dark, as the app sets no navigation theme
Focus:         the browser's default focus ring on the tab link
```

### Select Field

`SelectField` (`src/components/SelectField.tsx`): one choice among long names, such as the
specialty on the results screen.

```
Field:     #FFFFFF (white), 1px solid #E5DED6 (line), 16px radius, min height 44px, 16px sides,
           8px above and below
Value:     #141414 (ink), 15px, weight 700, one line with an ellipsis
Chevron:   ChevronDown 18px, #7A7A7A (muted), right, 8px gap
Pressed:   #FFFDFC (card)
List:      a sheet from the bottom of the screen: #FFFFFF, 24px top corners, scrim in shadow
           (rgba(103,18,31,0.14)), uppercase muted title (12px, weight 800, +1.5px tracking)
Rows:      min height 48px, 16px sides, full name #141414 15px weight 600; the current one
           weight 800 with an ink Check (18px, stroke 3). A row or the scrim closes the sheet
Custom:    `renderOption` draws an option in the field and in the rows instead of the name. It
           gets the name's text style there, so it can draw a name as is. The option's name stays
           its screen reader label. The results screen draws each specialty as a SpecialtyLabel
           (below): two lines at least, so the field grows from 44px to 56px, and
           more when the discipline wraps (76px for 136 at 320px)
Web:       hover and focus as cards (lineStrong border, shadow, red ring); a hovered row turns
           cream like a pressed one. From two columns the sheet is the text column (752px) at
           most, centered
```

### Specialty Name and Pictograms

Frontis names a specialty "court / discipline": "Mur à Gauche / P.G. Creuse Masculin Individuel".
`splitSpecialtyName` (`src/features/competitions/specialtyName.ts`) splits it at the first " / "
into the court, the discipline (Main nue, P.G. Pleine, P.G. Creuse, Xare, Pasaka, Joko Garbi,
Grand Chistera, Cesta Punta, whatever their spelling) and the rest (gender, format, group). Every
part keeps Frontis's spelling: they are proper names, never translated. `SpecialtyLabel`
(`src/components/SpecialtyLabel.tsx`) draws the result in the specialty picker (field and rows)
and on the player cards:

```
Court:      #7A7A7A (muted), 12px, weight 700, line height 16, after the court pictogram
            (16px, muted)
Discipline: the discipline and the rest as one text, in the place's own style (15px ink in the
            picker and on the cards), line height 20, after the discipline pictogram (20px,
            ink). It wraps, never cut, in the closed field too
Pictograms: a 20px column, 8px from the text, so the court and the discipline start at one edge.
            A court Kancha does not know keeps its label and leaves the column empty
Fallback:   a name without " / ", or with an unknown discipline, shows whole, as before: one
            line in the closed field, wrapping in the rows and on the cards
```

| Pair                                   | Light  | Dark (Ikurriña) |
| -------------------------------------- | ------ | --------------- |
| Court label (muted) on white           | 4.3:1  | 6.1:1           |
| Discipline pictogram (ink) on white    | 18.4:1 | 14.0:1          |
| Court pictogram (muted) on white (3:1) | 4.3:1  | 6.1:1           |

The muted court label reaches 4.3:1 on white in light, below the 4.5:1 of the other text pairs:
the discipline line under it names the specialty at full contrast.

Pictograms (`src/components/pictograms/`), one component per drawing, looked up in `PICTOGRAMS`
(`index.ts`) by discipline or court key:

```
Grid:       lucide's: 24 viewBox, 2px stroke, round caps and joins, no fill. Props as a lucide
            icon (color, size, strokeWidth, absoluteStrokeWidth); screens pass a palette color
Implements: one per discipline. Main nue: an open hand. Paleta gomme (P.G. Pleine and P.G. Creuse):
            the paleta and its ball. Xare: the long racket, its net along the hoop. Pasaka: the
            leather glove and its cuff. Joko garbi: the short chistera on its glove. Grand
            chistera: the long one. Cesta punta: the deep basket, its tip curled
Courts:     the walls. Place libre: the fronton, one wall over open ground. Mur à gauche: the
            front wall and the left wall. Trinquet: the closed court, the tambour slanting off
            the right wall
Decorative: hidden from screen readers (aria-hidden on web, accessibilityElementsHidden and
            importantForAccessibility on iOS and Android); the text beside them names the
            specialty
Legible:    at 20px in both themes; the courts at 16px beside their 12px label
```

These are first drawings. To replace one, from an illustrator's set for instance, change its
component or point its `PICTOGRAMS` key at another: no screen changes.

### Filter Chip

`FilterChips` (`src/components/FilterChips.tsx`): one choice among short names, such as the
category on the results screen.

```
Row:       horizontal scroll that bleeds over the 20px gutter (content padded 20px), 8px gap
Chip:      min height 34px (hitSlop to 44px), 14px sides, pill radius, one line
Resting:   #FFFFFF (white), 1px solid #E5DED6 (line), #262626 (text) 13px weight 700
Selected:  #141414 (ink) fill and border, #F7F4EF (cream) text. No red
Pressed:   #E5DED6 (line) fill
Overflow:  a 40px fade from transparent cream to cream on the right edge while chips remain to
           the right. A selected chip that starts off screen scrolls to the gutter
Web:       hover gives an unselected chip a lineStrong border; keyboard focus the red ring. The
           row gains 4px above and below inside the scroll view (and loses it outside), so the
           ring is not clipped
Wrap:      `wrap` prop: the chips flow onto several lines inside the gutter, with no scrolling,
           no bleed and no fade. The results screen always wraps them, on a phone too, so no
           category hides off screen
Bleed:     `bleed="start"`: the row bleeds over the left gutter only and ends where the control
           after it starts, the fade at that end. No screen uses it since the results screen
           wraps its chips
```

### Segmented Control

`SegmentedControl` (`src/components/SegmentedControl.tsx`): switches between views of the same
content, such as Liste / Tableau / Classement.

```
Track:     #E5DED6 (line), pill radius, 3px padding, 2px between segments, 44px tall
Segment:   min height 38px, 8px sides, 14px icon + 13px label, centered, pill radius
Widths:    equal (flex 1) when each segment is 104px wide or more (a 322px track for three):
           the longest label, "Clasificación" (es, 83px), fits with 5px to spare. Narrower, as
           on a 320 or 360px phone, each segment starts from its label's width and they share
           the rest, so "Classement" (fr) and "Clasificación" keep every letter. Until the track
           is measured, segments take their labels' widths (`segmentFit` in
           `src/features/layout/segments.ts`)
Inactive:  no fill, #262626 (text), weight 700
Active:    #FFFFFF (white) segment, 1px #CBBFB2 (lineStrong) ring and a 0 1px 4px shadow
           (shadow), #141414 (ink) icon and label, weight 700
Icons:     shown only when each segment is 124px wide or more (a 382px track for three),
           read from the track's width, not the window's: narrower, the longest label
           ("Clasificación", es) no longer fits beside its icon. On the results screen, labels
           only on a phone and at 768 and 1280px wide; icons at 1024 and 1440px
Icon only: `iconOnly` prop: 44px segments, an 18px icon and no label (142px for three); the
           label stays each segment's accessible name. No screen uses it since the results
           screen gave the view switch its own row on a phone
No red:    picking a view is not an action
Web:       hover tints an inactive segment lineStrong; keyboard focus draws the red ring
Keys:      a tablist of tabs with aria-selected; Tab reaches each segment, Enter and Space
           select it. react-native-web presses a Pressable on Space for the button role only,
           so the control handles Space itself on web (`selectOnSpace`)
```

| Pair                                  | Light  | Dark (Ikurriña) |
| ------------------------------------- | ------ | --------------- |
| Chip label (text) on white            | 15.1:1 | 11.9:1          |
| Selected chip label (cream) on ink    | 16.8:1 | 17.3:1          |
| Inactive segment label (text) on line | 11.4:1 | 10.0:1          |
| Active segment label (ink) on white   | 18.4:1 | 14.0:1          |
| Active segment (white) on the track   | 1.3:1  | 1.2:1           |
| Active ring (lineStrong) on the track | 1.4:1  | 1.5:1           |
| Active ring (lineStrong) on white     | 1.8:1  | 1.8:1           |

The active segment stands out from the track by less than 3:1, and in dark it is darker than the
track. The lineStrong ring, the shadow and `aria-selected` carry the state. Both labels share one
weight, so the active label is no wider than the others: a bolder one was cut short ("Classeme…"
in French at 390px). The ring and the shadow take no room from the label, where a border would.

### Results Progress

On the results screen, a row in place of the old Total / Played / Pending strip:

```
Label:     "27 / 27 parties jouées", #262626 (text), 13px, weight 700, tabular-nums
Bar:       flex 1, 6px, pill radius, #E5DED6 (line) track, #141414 (ink) fill
Done:      a dark StatusPill ("Terminé") at the end of the row once every match has a score.
           When the results also hold a final, the Final Summary card takes the row's place
Grid:      from two columns (web), in the filter column the row moves under the segmented
           control; with the filter bar it stays on its own line under the bar
Scrolling: never pinned: outside the filter column, it scrolls away with the results
```

### Final Summary Card

`FinalSummaryCard` (`src/components/FinalSummaryCard.tsx`) leads a finished competition with
its result. It replaces the Results Progress row, in the same place, in the list and the bracket
views, when every match has a score and the results hold one final whose score names a winner. A
competition in progress keeps the row, as does one with pools only. So does a category whose
final is played but where a match has no score: lcapb 500/138/1573 has three pool matches with
no score, and 9 of the 17 categories with a final in Championnat CCAPB 2024-2025 have at least
one. The data comes from the results the screen already loaded, through `finalSummary` in
`src/features/competitions/finalSummary.ts`: no new request.

```
Card:        #FFFFFF, 1px #E5DED6 border, 16px radius, 12px top and bottom, 14px sides. Its
             parts are split by 1px #E5DED6 hairlines, 12px above and below each
Head:        the Trophy (18px, amber #C8900A) in a 32px amberBg circle, the title "Vainqueurs"
             (#141414 15px weight 800, 20px line, a header), then a dark StatusPill "Terminé"
             at the end. 10px gaps, 10px above the winners
Winners:     their players as PlayerLink pills (36px high, cream #F7F4EF, 1px #E5DED6 border,
             18px radius, the name #141414 14px weight 700, a ChevronRight 14px #7A7A7A), 8px
             apart, wrapping; each opens the player (`/competitions/player?licence=…`). A
             player whose lineup has no licence is plain text, same type. Under them, the club,
             #7A7A7A 12px weight 600, 16px lines. A team without lineup shows its club in the
             players' style. The team number is not shown: results do not carry it
Final:       a label line, "FINALE" #7A7A7A 11px weight 700 uppercase +0.6px tracking, then
             " · Samedi 31 octobre 2026" (12px weight 600, as written). Under it, 6px apart, the
             score, winners first, one "35–20" per set (#141414 20px weight 800, 22px line,
             tabular-nums), then, 12px to its right, "contre" and the beaten team (#262626 13px
             weight 600, 18px lines) over its club (#7A7A7A 12px)
Third place: the losers of the semi-finals: a "TROISIÈME PLACE" label as above, then each team,
             its players (#262626 13px weight 600) over its club. None without semi-finals
Facts:       one line, #7A7A7A 12px weight 600, 16px lines, a sentence: the team count, then the
             pool summary of every match ("6 équipes, 18 parties en 7 journées, du 6 septembre
             au 31 octobre")
Grid:        on a phone, where the progress row sits, full width. From three columns, in the
             filter column under the segmented control: at 1280 × 800 on 500/137/1573 (447px
             card, one line of chips) it ends 63px above the window's bottom at rest, 121px once
             the column sticks; on lidfpb 1/4/1 (chips on two lines) 65px and 123px. With the
             filter bar (two columns, and the bracket) a cell wide, on its own line under the bar
Text:        the score digits sit in their own Text (`finalScore`), so they can take a
             condensed font (#115) on their own
Screen reader: the title is a header, the winners' pills are buttons named by the player with
             the "opens the player" hint, then the club. The final and third place each read as
             one sentence, with the score in words and not with the dash: "Finale, Samedi 31
             octobre 2026 : gagnée 35 à 20 contre BOUDY Anais et COLAQUY Jennifer (E),
             PELOTARI CHANTECLER BX LAC", "Troisième place : MOREL Perrine et MARTIN Alizee,
             CANCHA BOIENNE; …". Each sentence is a group with that label, its printed text
             hidden, so it is not read twice. The facts line reads as printed
```

**Counting teams.** A team is the set of licences of a side, as the ranking matches them (§4
Ranking Table): two teams of one club meet in the pools (US BAZAS and CANCHA BOIENNE in 500/137/
1573), so clubs would undercount. A side without licences counts as its club. On every category
of lcapb 500 and 502 this gives the ranking's team count.

### Ranking Table

The ranking view (`RankingView`) is one line of summary over one table, a row per team. The rows
come from Frontis `rankings`, which has no points and no record; the record and the form come
from the results the screen already loaded (`useResultsByCompetition`, same query key: no new
request), through `buildTeamRecords` in `src/features/rankings/ranking.ts`. The row's screen
reader sentence comes from `rowLabel` in the same file.

```
Summary:      one line, no section header (the view toggle already names the view): the team
              count ("11 équipes"), #262626 (text) 13px weight 700 tabular-nums, then at the end
              the ranking status, a StatusPill: dark "Classement définitif", or soft
              "Provisoire" with its note under the line (#7A7A7A 13px weight 600). As wide as
              the table, 12px above it; none while the ranking loads, fails or is empty
Table:        one card: #FFFFFF, 1px #E5DED6 border, 16px radius, rows split by 1px #E5DED6
              hairlines. Full width on a phone; on web, 712px at most (the text column less its
              two gutters), left-aligned beside or under the filters
Head:         "Équipe" over the players, "Bilan" over the record: #7A7A7A 11px weight 700,
              uppercase, +0.6px tracking, 8px top and bottom. Hidden from screen readers
Row:          10px padding, two parts 4px apart. Top: the rank cell (22px), the players, the
              record over the form, then, for a pair, a ChevronDown (16px #7A7A7A), 8px gaps;
              a one-player row in a table with pairs keeps an empty 16px slot, so the records
              line up. Under it: the club line
Rank:         #141414 Barlow Condensed Black 15px, tabular-nums, centered, on the first
              player's line. The champion of a final ranking gets the Trophy (18px, amber
              #C8900A) instead
Players:      #141414 14px weight 700, 18px lines: one player per line, taking all the width
              left by the record. Never cut: a long name wraps onto a second line
Record:       wins-losses ("7-0"), #141414 Barlow Condensed Black 20px, 22px line,
              tabular-nums, right-aligned. "—", #7A7A7A, when no scored match is the
              team's. While the results load, or if they fail, the row shows without record
              and form
Form:         the last five results under the record, 4px below it, oldest first, right-aligned
              so the latest ones line up: 10px squares, 2px radius, 3px apart. A win is filled
              green #1F7A5A; a loss is empty, outlined 2px red #C8102E. Filled or empty carries
              the result without the colour, in a fifth of the width the lettered chips took.
              The squares are one image labelled in words ("derniers résultats : victoire,
              victoire, défaite…"), as the row's sentence says it. `FormSquares`
              (`src/components/FormSquares.tsx`), shared with the player page, which draws
              them at 18px
Club line:    across the row from the players' left edge, wrapping when long: the club name,
              #7A7A7A 12px weight 600, 16px lines, a link to the club page (§ Club page); the
              team number ("Équipe 2"), same style; the phase reached, a small StatusPill (amber
              "Champion", red for a forfeit, soft for the others, the league's text: "Finale",
              "1/2 finale", "Poules"). 6px apart, 4px between wrapped lines. Never cut
Text:         the rank, the record and the club name each sit in their own Text: the club name
              is a link (#112) and the digits take Barlow Condensed (§3) on their own
Press:        a one-player row opens the player (`/competitions/player?licence=…`). A pair's row
              opens, under it, the PlayerLink pills of its players (36px high, cream, 1px
              #E5DED6 border, `ranking-player-<licence>`), and its chevron turns up. Pressed and
              web hover: cream #F7F4EF fill. Keyboard focus: the red ring inside the table
              (−2px offset)
Screen reader: each row is one button labelled with a sentence: rank, players, club, team
              number, phase, wins, losses, then the last results in words ("Rang 1, NICOL
              Guillaume, GONZALEZ Antoine, CA BEGLAIS, Équipe 1, Champion, 7 victoires, 0
              défaite, derniers résultats : victoire, …"). A pair's row sets `aria-expanded`:
              accessibilityState is dropped on web
```

Measured on the web export with Mur à Gauche P.G. Pleine Masculin, 1ère Série of LCAPB 2025-2026
(11 pairs): no text is cut at 320, 375 or 390px, where 0.8.0 cut 7 player names and 7 club names
at 375px (3 and 4 of the 6 pairs of Pleine Feminine, 1ère Série 2026-2027, also none now). A
pair's row is 79px, 99px when its club line wraps onto a second line (6 of 11 rows at 375px, 5 at
390px); at 320px names wrap too, up to 117px. On web at 1280px every row is 79px. The summary
line is 27px: the table starts 129px higher than under the 0.8.0 section header. Red marks a loss here, the
opposite of the green win, besides its warning role in the pills.

**Matching a team to its matches.** By licence only: names carry suffixes ("(D)", "(S)", "(ED)")
and namesakes play in the same competition (PUCHEUX Theo and PUCHEUX Kevin in Championnat CCAPB
2025-2026). Frontis gives each lineup player a `number`, the licence, at times followed by a
second code ("097866 - 01-641-015"): its leading digits are compared with the ranking's
`players[].licence`. A side belongs to the team with exactly its
licences, or else to the one team that lists them all, as a team may list a third or fourth
player; a side that fits several teams, or none, counts for nobody. A match counts once its score
names a winner (`parseMatchScore`): unscored matches and even sets count for nobody. The form
orders the matches by date, then by round on the same day (the final after its semi-finals),
unreadable dates last.

### Results screen in the grid

On web, from two columns (§5 Columns). On a phone the screen keeps its order: filters,
progress, results. The filters there are three rows, 10px apart, pinned under the collapsed bar
(§4 Screen Header) on cream, 14px under the bar and 12px above a 1px line that shows once
collapsed:

```
Row 1:     SelectField, full width: the court above the discipline (SpecialtyLabel)
Row 2:     FilterChips (wrap), full width: every category in view, on a second line when they
           do not fit (three séries at 320px)
Row 3:     SegmentedControl, full width, with its labels (Liste, Tableau, Classement)
```

A view switch beside the chips, icons only, left them 185px of a 375px screen: the third série
sat entirely past the edge (0 of 103px at 375 and 390px), behind a cut second chip and the edge
fade. Each further line of chips adds 42px to the pinned block.

The pinned block (`PinnedHeader` in `details.tsx`) is the ScrollView's second child, pinned by
`stickyHeaderIndices` on iOS and Android and by `position: sticky` on web (react-native-web
renders `stickyHeaderIndices` that way). Whatever else must stay in view goes in it, under the
filters.

From three columns, the list and the ranking give the filters the first grid column:

```
Filters:   one cell wide, 12px from the results: SelectField, FilterChips (wrap),
           SegmentedControl, ResultsProgress or, once finished, the Final Summary card.
           position: sticky, 68px from the top (the 52px
           collapsed bar and 16px): they stay in view under the bar while the matches scroll.
           The bar alone is pinned
Results:   the other columns: the match grid, or the ranking table (712px at most)
```

With two columns, and always for the bracket, which needs the whole width to fit its rounds,
the filters sit in a bar above the results, and the results get every column:

```
Filter bar: one wrapping row, 12px gap: SelectField (a cell wide), FilterChips (wrap, the
            rest of the line, 200px at least), SegmentedControl (a cell wide), pinned under the
            collapsed bar as on a phone. ResultsProgress on its own line under them, with the
            results. When the line is too short, the segmented control drops to a second line
Results:    the match grid, the ranking table (712px at most) or the fit bracket
```

Switching to the bracket moves the filters from the column to the bar.

### Club page

`/competitions/club?id=<clubId>` (`src/app/(tabs)/competitions/club.tsx`): how one club does in a
season, from its results alone. Frontis `results(clubId, competitionId)` returns every match of a
club in a competition; the summaries are pure functions in `src/features/clubs/club.ts`.

```
Header:       the red band (§ Screen Header): back link, eyebrow "Club", the club's name as
              Frontis spells it ("AMIS DE LA PEL.BASQUE-LE HAILLAN"); a spinner while it loads.
              The follow button (§ Follow — button) in the back link's row once the name loads
Season:       a SelectField ("Saison"), the seasons of the competitions list (`groupBySeason`),
              the current season first and chosen by default. The choice goes to the URL
              (`&season=2025-2026`), so a reload or a shared link keeps it. Competitions without
              a season in their name are left out. 712px at most on web
Summary:      one card, three cells split by 1px #E5DED6 rules, as the player totals: Jouées,
              Gagnées, Perdues (#141414 26px weight 900 tabular-nums over #7A7A7A 11px weight
              700 uppercase). Played counts the matches with a score (`parseMatchScore`); a
              match between two teams of the club is played, neither won nor lost, and a note
              under the card says how many (#7A7A7A 13px weight 600), so the three add up
Entries:      "Engagements / Par spécialité": one card per competition, specialty and category,
              in the card grid. SpecialtyLabel, then "1ère Série · 23 parties" (#7A7A7A 12px
              weight 600, after the competition's name without its season when the season has
              several: "Championnat Jeunes CCAPB"), then a small
              StatusPill: amber "Champion" when the club won the final, soft with the furthest
              round otherwise (rounds.*: "Quarts de finale", "Barrages 2e tour"). A ChevronRight
              ends the card, which opens the results screen on the pair
              (`/competitions/details?id=…&specialtyId=…&categoryId=…`, CardLink). A result
              without a category gets no link
Results:      "Résultats / Derniers résultats": the five latest matches with a score, the latest
              first (by date, the later round first on one day), in one card with 1px hairlines,
              712px at most on web. A row: the opponent (#141414 15px weight 700) and the sets
              from the club's side ("35-22", #141414 15px weight 800 tabular-nums), the
              SpecialtyLabel (13px #262626), then a small StatusPill (green Victoire, red
              Défaite, soft Interne or Égalité) before "Demi-finale 1 · 3ème Série · sam. 9 mai"
              (#7A7A7A 12px weight 600). A match between two teams of the club reads "Entre deux
              équipes du club", its sets from the winner's side
See all:      under the card, the pill toggle of the season grid: "Voir les 108 parties" lists
              every match of the season, the latest first, matches to come with "—" and their
              date or "Date à venir"; "Voir les dernières seulement" folds it back.
              `aria-expanded` gives the state. None when the season has no more matches
Titles:       "Palmarès / Titres": the finals the club won, in the order of the entries. Cards
              with the 2px amber border of a won ranking: a 40px amberBg tile with the amber
              Trophy, SpecialtyLabel, "1ère Série · 15-1 15-5", then "Finale gagnée contre …" or
              "Finale entre deux équipes du club". A final between two teams of the club is one
              title; a lost, unscored or level final is none
States:       a spinner while the competitions or the results load; the error box (§ Error
              State) with Réessayer; "Aucune partie pour ce club en 2026-2027." (§ Empty State)
Screen reader: each result row and title card is one element labelled with a sentence
              ("Défaite, contre CA BEGLAIS, 24-35, Place Libre / P.G. Pleine Masculin,
              Demi-finale 1, 3ème Série, sam. 9 mai"); an entry is a button with its hint
```

**Loading.** One request per competition of the season, `limit: 500`, and a next page with
`offset` while a page comes back full (`matchesApi.listAll`). The query key is
`["results", { clubId, competitionId }]` (`clubResultsQuery` in `src/hooks/use-matches.ts`), and
`useClubResults` takes a list of club and competition pairs, so a player's matches (#119) reuse
it: a match found under two clubs counts once. The competitions list keeps the enabled
competitions only: on lcapb that is one Championnat per season, as Jeunes and Corpo are disabled.

**Club links.** `ClubLink` (`src/components/ClubLink.tsx`) turns a club name into a link wherever
it sits: the team rows of the match cards and bracket nodes, the club line of the ranking rows.
The name keeps its style; hover and press underline it, and keyboard focus draws the red ring
around the name (the link's own browser outline is off). On web it is a real `<a>` to
`/competitions/club?id=…`, without the `(tabs)` group: a click or Enter opens the page in the
app, and the browser can open it in a new tab. The link takes the press: the ranking row around
it does not open its player or its pair. On web the link stays in the accessibility tree, inside
the row's button. On iOS and Android the row is one accessibility element, so VoiceOver and
TalkBack reach a club from the match cards, not from a ranking row.

Measured on Amis de la P.B. Le Haillan (lcapb, club 4063), 2025-2026 (Championnat CCAPB,
competition 502): 108 matches, 108 played, 63 won, 31 lost, 14 between two of its teams; 11
entries; four titles: Mur à Gauche / P.G. Creuse Masculin Individuel in 1ère and 2ème Série and
Mur à Gauche / P.G. Pleine Masculin in 2ème Série (three finals between its own teams), and
Trinquet / P.G. Creuse Masculin in 3ème Série. The Trinquet / P.G. Creuse Masculin 2ème Série
final, lost to CA Béglais, is none. The club has results in 13 seasons, 2014-2015 to 2026-2027.

### Player page

`/competitions/player?licence=<licence>` (`src/app/(tabs)/competitions/player.tsx`): who a player
is and how they play, from two sources. Frontis `playerRankings(licence)` loads first and fills
the header and Honours; the matches (`usePlayerMatches`, #119) follow. The screen logic is pure
functions in `src/features/players/` (`profile.ts`, `matches.ts`, `stats.ts`), which take the
matches whatever their source, so Frontis player statistics (frontis#109) can replace the loading.

```
Header:       the compact red band (§ Screen Header): back link, eyebrow "Joueur", the name as
              the rankings spell it, then "Licence 066629 · AMIS DE LA PEL.BASQUE-LE HAILLAN":
              the club of the most recent ranking, the current one. The initials (first and last
              word, suffixes such as "(E)" left out) in a 56px redDark circle with a 1.5px
              onRedSoft ring, #FFFFFF 20px weight 800, hidden from screen readers. The follow
              button (§ Follow — button) in the back link's row. The club is plain text: the
              link's red focus ring would not show on the band
Figures:      one card, two rows of two cells split by 1px #E5DED6 rules: Titres, Bilan
              ("29-7"), Taux de victoire ("81 %"), Saisons. Values in Barlow Condensed Black 30px
              (§3), #141414, over #7A7A7A 11px weight 700 uppercase labels. Titles and seasons
              come from the rankings; the record and win rate show "—" in muted until the
              matches load. Four in a row would give each label 78px at 390px, where
              "DENBORALDIAK" (eu) takes 100px and "TAUX DE VICTOIRE" (fr) 118px
Tabs:         a SegmentedControl: Aperçu, Parties, Palmarès. The tab goes to the URL
              (`&tab=matches`, `&tab=honours`), so a reload or a shared link opens it; a missing
              or unknown tab is the overview (`parsePlayerTab`). Rendered once the rankings
              load, so the static HTML and the first client render match. The panel under it
              has role tabpanel, named after its tab
```

**Overview.** On a phone, in this order:

```
Form:         "Forme / Derniers résultats": the last 10 results with a winner, oldest first, as
              the ranking's squares (`FormSquares`, 18px here, 10px in a ranking row), then
              "Série en cours : 7 victoires" (#262626 13px weight 600). A level match is played
              but in neither
Latest season: "Dernière saison / 2025-2026": one row per ranking of the most recent season,
              in one card with hairlines. SpecialtyLabel and the record on the right (Barlow
              Condensed Black 20px); "1ère Série · <club>" (#7A7A7A 12px, the club a ClubLink);
              then the phase pill (amber "Champion", red forfeit, soft league text, soft
              "Provisoire" too) and "7 parties · manches 14-1"
Specialties:  "Par spécialité / Spécialités": one table, a row per specialty the player was
              ranked or played in, the most played first. Head "Spécialité" over "Bilan" (11px
              uppercase, hidden from screen readers). A row: SpecialtyLabel, the record, then
              the best final ranking as a pill (amber "Champion", or "2 titres"; soft with the
              league's phase otherwise) and "19 parties"
Partners:     "Partenaires / A joué avec": the players who played on their side, the most
              matches first: a row per partner, the name over "24 parties", the record and a
              ChevronRight; it opens the partner. Ranking teammates with no match together go
              on one muted line under the card: "Dans la même équipe, sans partie ensemble :
              NAVARRINE Olivier, FIGEROU Benedict, GARCIA Antoine."
Opponents:    "Adversaires / Les plus affrontés": the five most met, then the latest met. The
              name over "4 parties · dernière : sam. 28 févr. (2025-2026), Victoire 15-8 15-3",
              the record from the player's side, a ChevronRight; it opens the opponent. The
              score and the season are joined with word joiners, so they never wrap inside
```

**Matches.** Season chips (FilterChips, wrapped): "Toutes", then each season with a match, the
latest first; the choice goes to the URL (`&season=<competition id>`). Each season is a header
card, its season (#141414 16px weight 800, a header) over "17 parties", its record and a
ChevronDown. It is a button with `aria-expanded`. With "Toutes" the latest season opens and the
past ones show their record only; a chip opens its season alone. Under an open season, a group
per specialty and category, the latest played first: SpecialtyLabel over "1ère Série · 10
parties", the group's record on the right, then its matches, the latest first, in one card with
hairlines. A row: the opponents (#141414 15px weight 700) and the sets from the player's side
(Barlow Condensed Black 18px, "—" in muted for a match to come); the opponents' club (ClubLink)
and "· Avec JANY Alexandre"; then the outcome pill (green Victoire, red Défaite, soft Égalité)
and "Finale 1 · sam. 28 févr." Each row is one element labelled with a sentence.

**Honours.**

```
Titles:       "Palmarès / Titres": each final ranking won, the latest first, as the club page's
              title card (2px amber border, the Trophy tile): SpecialtyLabel, "1ère Série ·
              2025-2026", then, once the matches load, "Finale gagnée contre DUFFOUR-NONNON Lucas
              (D)", the sets (Barlow Condensed Black 18px) and the date. The final is the won
              match of phase F in the title's competition, specialty and category; a title whose
              final is not found keeps its card without it. "Aucun titre pour l'instant." when
              none
Rankings:     "Historique / Saison par saison": one table, a cream head row per season (its
              competition's name, 11px uppercase), then a row per ranking: the rank (Barlow
              Condensed Black 18px) or the amber Trophy for a title, SpecialtyLabel, "1ère Série ·
              <club>" with a ClubLink, the phase and "Provisoire" pills. A season of one ranking
              is no card of its own
Clubs:        "Clubs / Par saison": one card, a row per season: the season (#7A7A7A 13px weight
              700, tabular-nums, 84px) and its clubs, each a ClubLink (#141414 14px weight 700)
```

**Wide web** (§5 Columns, two columns and up): the player in the first grid cell (`cellWidth`),
the tabs beside it, 12px apart, 712px at most. The cell holds the figures, the form, the latest
season and the specialties; the overview tab then holds the partners and the opponents only, so
nothing shows twice. At 1280 × 900 the cell is 363px and the tabs 712px; at 1000px, 410px each.
No card stretches across the window: every list is one table in its column.

**Loading and errors.** The band shows a spinner until the rankings load; then the figures, the
tabs, the latest season and the specialties (records "—") show, and Honours whole, its titles
without their finals. Until the matches load, one spinner stands in the form's place, or in the
matches tab's panel; if they fail, one error box with Réessayer stands there instead (React
Query retries three times first), and the header and Honours stay. The wide layout shows it once:
in the cell, or in the matches tab when that tab is open. A rankings error shows the error box
alone; a licence without rankings shows "Aucun classement trouvé pour cette licence."

**Counting.** By licence only, as the ranking table (§ Ranking Table). Every record counts the
matches with a score; a level match is played, neither won nor lost, and out of the form and the
streak. A lineup player without a licence shows in the match but is in no record, no partner and
no opponent list. Names show as Frontis sends them, suffix included ("SEINDERAIN Gerard (E)").

**Keyboard and screen readers.** The segments are tabs in a tablist with `aria-selected`
(react-native-web drops accessibilityState). Tab reaches them; Enter and Space select one:
react-native-web presses a non-button on Enter only, so `SegmentedControl` handles Space itself
on web. Each figure is one element ("Bilan: 29 victoires, 7 défaites"; "Bilan: Chargement" while
the matches load); the form squares read as one image.

Measured on PUCHEUX Theo (lcapb, licence 066629), from Frontis on 23 November 2026: header AMIS DE
LA PEL.BASQUE-LE HAILLAN, 2 titles, 29-7, 81 %, 4 seasons; sets 55-14; streak 7 wins; two titles,
15-1 15-5 against DUFFOUR-NONNON Lucas (D) (Mur à Gauche / P.G. Creuse Masculin Individuel, 1ère
Série, 2025-2026, a final between two teams of Le Haillan) and 15-3 15-6 against FEVRIER Mathieu
and SEINDERAIN Gerard (E) (Trinquet / P.G. Creuse Masculin, 2ème Série, 2023-2024); partners JANY
Alexandre (24, 18-6) and SENDER Timothe (5, 4-1), NAVARRINE Olivier, FIGEROU Benedict and GARCIA
Antoine on the teammates line. The web export, replayed from those responses, shows the same at
390 × 844 and 1280 × 900, light and dark, without a console error; in French, Basque and Spanish
no text is cut at 390 or 320px. Chrome's accessibility tree names each tab with its selected
state, the panel, each figure, specialty row and match row with its sentence, the season toggles
with their expanded state and the chips with their checked state; the match rows are no Tab stop.

### Follow — button

`FollowButton` (`src/components/FollowButton.tsx`): "Suivre" / "Suivi", in the header band's
action slot (the back link's row, on the right) of the club page, the player page and the
results screen. It follows a club, a
player, or the competition, specialty and category on screen, in the selected league. One
component, so a redesigned screen (the player page, #120) keeps it by placing it in its header.

```
Shape:         pill, 44px high and wide at least (minHeight, minWidth: the touch target, as web
               ignores hitSlop), 14px sides, rounded.full, 6px between the star and the label
Off:           "Suivre": 1.5px onRedSoft border, no fill; 18px Star outline and the label in
               onRedStrong, 15px weight 700
On:            "Suivi": onRedStrong fill and border; the Star filled and the label in redFill
Hover, press:  redDark fill when off; onRedSoft fill and border when on
Focus (web):   2px onRedStrong outline, 2px offset, keyboard focus only: the red ring would not
               show on the band
Hidden:        until the league and the saved favourites load, so it never shows a wrong state,
               and until the names it saves are known: the club, the player's rankings (none
               for a licence without rankings), the competition, specialty and category
Results:       on the band only: the collapsed bar has no action slot. The label names the
               specialty and category, as the band's title is the competition
Screen reader: a button named after what it follows and its state, the visible word first:
               "Suivre AMIS DE LA PEL.BASQUE-LE HAILLAN", "Suivi : PUCHEUX Theo", "Suivre Mur à
               Gauche / P.G. Creuse Masculin Individuel, 1ère Série". The state also goes to
               accessibilityState (selected) on iOS and Android, and to aria-pressed on web,
               where accessibilityState never reaches the DOM
Press:         a Pressable: it takes the touch on iOS and Android, and its click does not bubble
               on web, so a card or row around it does not open too
```

| Pair (on redFill)                                      | Light (`#C8102E`) | Dark (`#B5142F`) |
| ------------------------------------------------------ | ----------------- | ---------------- |
| Label, star (onRedStrong) on the band                  | 4.95:1            | 5.68:1           |
| Border (onRedSoft) on the band                         | 4.61:1            | 4.73:1           |
| Label (onRedStrong) on the hover fill (redDark)        | 7.27:1            | 9.97:1           |
| Followed pill (onRedStrong) on the band                | 4.95:1            | 5.68:1           |
| Label, star (redFill) on the followed pill             | 4.95:1            | 5.68:1           |
| Label (redFill) on the followed hover fill (onRedSoft) | 4.61:1            | 4.73:1           |

**Store.** `useFavouritesStore` (`src/store/favourites-store.ts`), saved on the device as
`kancha-favourites` (zustand persist, AsyncStorage), with no account. `byLeague` holds, by league
id, `clubs` (id, name), `players` (licence, name or null) and `categories` (competitionId,
specialtyId, categoryId and their three names), each in the order followed; ids repeat across
leagues, so a favourite belongs to one league. The names are saved with the ids, so the Suivis
section shows offline and sends no request. A league whose last favourite goes is dropped. The
add, remove and toggle helpers and the `selectLeagueFavourites` and `selectIsFollowed`
selectors are plain functions with unit tests; the notifications (#137) send this list to
Frontis.

### Follow — Suivis section

At the top of the Competitions screen, above "Trouver un joueur": a shortcut to each favourite of
the selected league. None when the league has no favourite, or before the saved ones load.

```
Header:        SectionHeader "Favoris" / "Suivis", 12px above the cards
Cards:         the icon card (§ Cards — Icon Card) in the card grid, one cell wide: the clubs,
               then the players, then the categories, each in the order followed. Icon tile:
               Shield (club), User (player), Trophy (category)
Kind:          above the title, #7A7A7A (muted) 11px weight 800 uppercase, +0.8px tracking:
               "Club", "Joueur", "Catégorie"; 4px between the lines
Title:         #141414 (ink) 16px weight 800, line-height 21px: the club's name, the player's
               name ("Licence 066629" without one), or the category's specialty as a
               SpecialtyLabel, with its pictograms
Meta:          #7A7A7A 13px: "Licence 066629" under a player's name; "1ère Série · Championnat
               CCAPB 2025-2026" for a category; none for a club
Opens:         the club page (`/competitions/club?id=…`), the player page (`?licence=…`), or the
               results screen on the pair (`/competitions/details?id=…&specialtyId=…&categoryId=…`),
               through CardLink (§ Link previews)
Screen reader: a button labelled with the kind, the title and the meta ("Club, AMIS DE LA
               PEL.BASQUE-LE HAILLAN"), with the hint of its target ("Ouvre la page du club")
```

Measured on lcapb: club 4063 (AMIS DE LA PEL.BASQUE-LE HAILLAN), player 066629 (PUCHEUX Theo)
and Mur à Gauche / P.G. Creuse Masculin Individuel, 1ère Série, in Championnat CCAPB 2025-2026
(competition 502, specialty 136, category 1573), followed from their screens, show in Suivis
and open them; they stay after a reload, and the section hides on lidfpb.

### Score — Setup

The Score tab (`src/app/(tabs)/score/index.tsx`) is the new match form. When a match starts, it
saves the last six team names and the target on the device only (`useScoreSetupStore`,
AsyncStorage key `kancha-score-setup`). The rules live in `src/features/score/setup.ts`.

```
Teams:     two text fields (Inputs — Text Field), each with its team marker. Under each, the
           recent teams as Filter Chips, most recent first, minus the team in the other field
           (whatever its case). A press fills the field; the chip matching the field is
           selected. A scrolling row on a phone, wrapped from two columns (web). None before the
           first match
Target:    Filter Chips, wrapped: 30, 35, 40, "Autre". "Autre" opens a number field under the
           chips, focused when pressed, which takes any positive number. The form opens on the
           last target: its chip, or "Autre" holding it. Nothing selected before the first match
Start:     a bar under the scroll view, never scrolled: cream, 1px line top border, 12px × 20px
           padding, in the text column on web. The button: redFill, 16px radius, 18px top and
           bottom, label #FFFFFF 17px weight 900 on one line, "Commencer · en 35" once a target
           is set, "Commencer" before. 35% opacity, disabled, until both teams and a target are
           set. Screen readers hear "Commencer la partie en 35 points"
Insets:    the screen has its own SafeAreaProvider. A SafeAreaView takes the insets of the
           nearest provider, and the root one sits outside the native tab bar: its bottom inset
           is the home indicator alone. Inside the tab, the bottom inset covers the tab bar
           (iOS) and is 0 above the Material bar (Android). The bar pads its bottom by it
Keyboard:  the KeyboardAvoidingView is the screen's root, at the top of the window, as it
           measures its overlap with the keyboard from its own frame. The keyboard covers the
           tab bar, so keyboardVerticalOffset takes back the bottom inset: the button sits on
           the keyboard
```

Presets: 35 and 40 are the targets of every scored match in the 2026-2027 CCAPB championship
(Frontis, competition 500 in lcapb: 149 to 35 and 158 to 40, the five finals to 35). 30 is there
for shorter games.

| Pair                               | Light  | Dark (Ikurriña) |
| ---------------------------------- | ------ | --------------- |
| Chip label (text) on white         | 15.1:1 | 11.9:1          |
| Selected chip label (cream) on ink | 16.8:1 | 17.3:1          |
| Start label (#FFFFFF) on redFill   | 5.88:1 | 6.76:1          |

### Score — Match mode

The Score tab holds the setup. Start opens the match: the route `/match`
(`src/app/match.tsx`), outside the tabs, in the root Stack with `presentation: "fullScreenModal"`.
It covers the tab bar, and the rail on web, until the match is closed. The teams and the target
go to it as params. Without valid params, as on a reload, it goes back to the setup.

```
Halves:      two flex 1 halves: team A on redFill (top), team B on panel (bottom), each padded
             by the safe area on its screen edge. The whole half is the +1 button, labeled with
             the team, its score and the target. Pressed: 8% white over the half
Content:     24px side padding, in the text column on web (useTextColumn). Top half: team row,
             score row, bar. The bottom half mirrors it, so the bars meet at the seam
Team row:    name #FFFFFF 22px weight 900, one line, then the undo button in the outer corner
Undo:        48×48, radius 16, rgba(255,255,255,0.16) (pressed 0.30), Undo2 22px #FFFFFF,
             labeled "Undo the last point of <team>". Disabled, 35% opacity, at 0
Score:       Barlow Condensed Black 112px, line height 1.0, tabular-nums, #FFFFFF. "/ target"
             Barlow Condensed Bold 28px onRedSoft, its baseline on the score's. A "+1" pill (rgba(255,255,255,0.16), 20px weight 900) ends the row.
             Hidden from screen readers: the +1 label carries the score
Bar:         6px, pill radius, rgba(255,255,255,0.18) track, #FFFFFF fill, score / target
Close:       48px #FFFFFF circle centered on the seam, X 22px in panel, shadow
             0 4px 16px rgba(0,0,0,0.25). At any score but 0–0 it asks first: Alert on iOS and
             Android, window.confirm on web
Focus (web): a 2px #FFFFFF ring, as red disappears on red: inside the half (offset −6px),
             outside the buttons (offset 2px)
Win:         the green screen: trophy, winner, both scores. "Share" (Share card) and "Undo last
             point", both outlined (1px rgba(255,255,255,0.4)), above "New match" (redFill),
             which goes back to the setup
Device:      the screen stays on while a game is played, not on the win screen (expo-keep-awake,
             the Wake Lock API on web). Haptics on iOS and Android: an impact per point, a
             selection tick per undo, a success on the win
```

### Share card

`ShareCard` (`src/components/ShareCard.tsx`): one match as an image to post, 1080 × 1350 px
(4:5, a portrait Instagram post), built by `resultCardData` or `scoreCardData`
(`src/features/share/share-card.ts`). Like a printed card, it does not follow the app theme: it
always takes the light palette (`KanchaColorsLight`), and its text ignores the system text size.
Sizes below are image pixels.

```
Canvas:     cream
Band:       redFill, 80px side padding, 56px top and bottom, 72px bottom corners. KanchaLogo
            mark 88px high (the cream mark alone, 50px wide) and "Kancha" #FFFFFF 44px weight
            900, 24px apart. 36px below: the competition (onRedStrong 30px weight 800, uppercase,
            +4px tracking, one line), the specialty (#FFFFFF 56px weight 900, two lines), the
            category (onRedStrong 38px 700)
Meta:       48px under the band. The round in a pill: ink 30px weight 800, uppercase, +2px,
            28px × 14px padding, white with a 3px line border; the Final in amberBg with an
            amber border and a Trophy. Then the long date with its year ("Samedi 28 février
            2026"), ink 34px weight 700
Teams:      a white card 32px below: 3px line border (6px red for the Final), 48px radius, 44px
            side padding. Each team, 28px top and bottom: a 56px winner slot (green Check,
            stroke 3), the players (ink 44px, two lines) over their club (muted 30px weight 600,
            two lines), then one column per set: 92px, right-aligned, 110px min width, 28px
            apart, tabular-nums. Winner 800 with sets 900; loser 600 with muted sets 400; no
            winner, both 700. A 3px line between the teams
Link:       64px from the bottom: "Résultats sur Kancha" (muted 30px weight 600), then the
            results screen's public link (`shareUrl`) without https://, ink 34px weight 700, two
            lines, breaking after "?" and "&"
Match mode: eyebrow "Partie", the target as title ("En 40 points"), no category or round,
            today's date, the final points in one column, and kancha.pilotariak.com/score
```

Where it is shared from:

```
Results:  a Share button at the end of a scored match's phase line, in the day cards: a 32px
          circle, Share icon 16px muted (Share2 on Android), cream when pressed or hovered, the
          red focus ring. Negative margins keep the line's height; hitSlop brings the touch area
          to 44px. Labeled "Partager le résultat de <A> contre <B> en image". A match without a
          score has none
Win:      "Share", outlined, Share icon 18px #FFFFFF, labeled "Partager le score en image"
Never disabled: a press while a card is on its way does nothing, and focus stays on the button
```

iOS and Android render the card off screen (one at a time, on demand), capture it with
react-native-view-shot and open the system share sheet with the PNG through expo-sharing: stories,
messages, saving to photos. The link is in the image. Web makes the same PNG with view-shot's web
module (html2canvas), then calls `navigator.share({ files })` where `navigator.canShare` accepts
files, else downloads it. Closing the sheet without sharing is not an error.

On web, html2canvas copies the app's stylesheet with the server-rendered rules last, which then
override the classes created in the browser. The card therefore uses plain style objects, which
react-native-web writes inline, never `StyleSheet.create`.

### Error State

```
Background:   #FDE8EC
Border:       1px solid rgba(200,16,46,0.2)
Text:         #970D25, 14px, weight 600
Border-radius: 16px
Padding:       16px
```

### Empty State

```
Background:   #FFFFFF
Border:       1px solid #E5DED6
Border-radius: 16px
Padding:       20px, centered
Text:         #7A7A7A, 14px, weight 600
```

### Inputs — Text Field

```
Background:    #FFFFFF (white)
Border:        1px solid #E5DED6 (line)
Border-radius: 16px
Padding:       16px 18px
Text:          #141414 (ink), 16px, weight 700
Placeholder:   #6E6E6E (placeholder)
Label:         #141414, 13px, weight 800, uppercase, +0.8px tracking, 8px above the field
Team marker:   10px dot before the label, 8px gap: red for team A, ink for team B
Focus (web):   2px red edge (#C8102E light, #F5586E dark), mouse or keyboard. No browser outline
```

Every field uses this one style, built from palette tokens so it follows the theme. Never tell fields apart by their fill: put a marker next to the label instead. Keep the text at 16px: mobile Safari zooms the page into a focused field set smaller.

On web, a focused field drops the browser's outline (`outlineStyle: "none"` on the input) and shows a red edge: the 1px border turns red and an inset 1px red shadow draws the second pixel inside it. The field keeps its size, as the border stays 1px wide: a 2px border would need each field's padding cut by 1px, and a box that gets its height from its input has no padding to cut. The edge goes on whichever element draws the border: the input itself or, on a field with an icon (player search, date, venue, player name), the box around the input and its icon. Use `useFieldFocus` (`src/hooks/use-interaction-styles.ts`) for every new field. Unlike a Pressable's ring, the edge also shows after a click, and on a field the browser focused before React hydrated (`autoFocus`). iOS and Android are unchanged.

| Pair                                 | Light  | Dark (Ikurriña) |
| ------------------------------------ | ------ | --------------- |
| Typed text (ink) on the field        | 18.4:1 | 14.0:1          |
| Placeholder on the field             | 5.1:1  | 6.1:1           |
| Team A marker (red) on cream         | 5.4:1  | 5.8:1           |
| Team B marker (ink) on cream         | 16.8:1 | 17.3:1          |
| Focus edge (red) on the field        | 5.9:1  | 4.7:1           |
| Focus edge (red) on cream, around it | 5.4:1  | 5.8:1           |
| Focus edge (red) on card, around it  | 5.8:1  | 5.2:1           |

The edge stays above the 3:1 that WCAG 1.4.11 asks of a focus indicator, against the field and against the surface around it (cream on the score and player search screens, card in the form cards).

---

## 5. Layout Principles

### Spacing scale

| Token | Value   | Usage                                  |
| ----- | ------- | -------------------------------------- |
| xs    | 4px     | Gap inside text stacks (eyebrow→title) |
| sm    | 8px     | Icon/text gap, inner metadata rows     |
| md    | 12px    | Card list gap (between cards)          |
| lg    | 14px    | Match card inner padding, match meta   |
| xl    | 18–20px | Card padding, screen horizontal gutter |
| 2xl   | 22px    | Between major content sections         |
| 3xl   | 24px    | Featured card padding                  |
| hero  | 120px   | Bottom padding (tab bar clearance)     |

### Border-radius scale

| Token | Value   | Usage                               |
| ----- | ------- | ----------------------------------- |
| pill  | 9999px  | Status pills, score badges          |
| round | 20px    | Standard cards, picker rows, badges |
| hero  | 24px    | Featured cards, hero sections       |
| icon  | 12–14px | Icon bubbles, small square buttons  |
| chip  | 16px    | Error/empty boxes                   |

### Container & grid

- **Screen padding:** 20 px left/right, consistent across all screens.
- **Content gap:** 22 px between major stacked sections within a ScrollView.
- **Single-column layout** on a phone. On web, wider windows add columns of cards (below).
- **The player page** gives the player a grid cell and the tabs the rest, 712 px at most
  (§4 Player page): its lists are tables, not card grids.
- **Grid screens** (leagues, competitions, results, player search): their
  lists of cards go through `CardGrid` (`src/components/CardGrid.tsx`), with `columns` from
  `useWebLayout()`. In one column, `CardGrid` is the list as it was. Season tiles are half a
  card: two per column. Nothing caps the width: a wider window gets more columns.
- **The ranking** is one table, not a grid (§4 Ranking Table): it keeps to the text column
  less its gutters, `TEXT_MAX_WIDTH − 2 × GUTTER` (712 px), left-aligned in the results column.
- **Text screens** (About, Score): their content keeps to the text column, `useTextColumn()`
  (`src/hooks/use-layout.ts`): two cards wide, 752 px with its gutters, centered. Add it to the
  view that holds the 20 px gutter, and pass it to `ScreenHeader` (`column`).

### Columns (web)

`src/features/layout/breakpoints.ts`. The breakpoints come from the phone card, not from device
sizes: the card is 350 px (a 390 px screen less its 20 px gutters), cards sit 12 px apart, and
a column is added each time one more card fits. iOS and Android always use the phone layout.

```
gridWidth(n)  = n × 350 + (n − 1) × 12 + 2 × 20     content width that holds n cards
columnsFor(w) = the most cards that fit in w, one at least
rail          = from gridWidth(2) + 128 (the rail) = 880px: two columns still fit beside it
text column   = gridWidth(2) = 752px
```

| Columns | Content width | Window, bottom tabs | Window, with the rail |
| ------- | ------------- | ------------------- | --------------------- |
| 1       | below 752px   | below 752px         | —                     |
| 2       | 752px         | 752–879px           | 880–1241px            |
| 3       | 1,114px       | —                   | 1,242–1,603px         |
| 4       | 1,476px       | —                   | 1,604–1,965px         |

Cards fill their cells: a card is 350 px at least, and grows until one more card fits (at most
about 530 px, with two columns). Below 752 px the web is the phone layout.

The static web export renders without a window, so its HTML holds the phone layout. React
hydrates that layout, then switches to the window's size: a wide window shows the phone layout
for a moment while the page loads.

- **Header band:** the screen header (back link, eyebrow, title, subtitle) sits in a solid red band at the top of the scroll view. Its text is white (`#FFFFFF`, `onRedStrong`, `onRedSoft`). Everything below the band is on cream and uses ink/muted, whatever the screen's content height.

### Header band architecture

```
Position:   first child of the screen's scroll view, outside the 20px gutter (full width)
Height:     sized by its content, no fixed height
Fill:       redFill, solid: no gradient, no decorative circles
Corners:    24px bottom radius (rounded.hero)
Status bar: the screen's SafeAreaView (edges={["top"]}) has a redFill background and the
            scroll view a cream one, so the red continues behind the light status bar
Scrolling:  the band scrolls with the content; the red top edge stays behind the status bar.
            On the results screen, the collapsed bar pins in its place (§4 Screen Header)
```

The band holds the screen header only. Section titles, cards, loaders and empty or error states
sit on cream below it.

---

## 6. Depth & Elevation

| Level | Surface                    | Method                                               |
| ----- | -------------------------- | ---------------------------------------------------- |
| 0     | Cream screen bg            | `#F7F4EF` — no border, no shadow                     |
| 1     | List card                  | `#FFFDFC` + `1px solid #E5DED6`                      |
| 2     | Day card (played)          | `#FFFFFF` + `1px solid #E5DED6`                      |
| 3     | Header band, featured card | `#C8102E` — color itself signals prominence          |
| 4     | Final day card             | `#FFFFFF` + `2px solid #C8102E`                      |
| 5     | Logo / FAB button          | Red bg + `rgba(103,18,31,0.14)` shadow, `0 6px 16px` |

**Shadow philosophy:** Shadows are red-tinted (`rgba(103,18,31,0.14)`) — never cool-gray (`rgba(0,0,0,0.x)`). This ties elevation to the brand color and keeps the warm palette coherent. Shadows are used sparingly — only on the About screen logo and action buttons — not on resting list cards. On web, a hovered card or field lifts with `0 4px 16px` in the shadow token (§4 Interaction states).

**Depth through border color, not shadow stacking.** The `line` color (`#E5DED6`) is warm enough to separate white cards from cream without needing elevation.

---

## 7. Do's and Don'ts

### Do

- ✅ Use `#F7F4EF` (cream) as the page/screen background — not `#FFFFFF` or `#F5F5F5`.
- ✅ Limit red to purposeful elements: hero cards, CTAs, scores, active states. One red element per screen hierarchy level.
- ✅ Always use uppercase + letter-spacing (+1.4–1.6 px) for eyebrow labels.
- ✅ Use `line` (`#E5DED6`) as the universal border/divider color on light surfaces.
- ✅ Put the screen header in `ScreenHeader` (white on the red band); use ink/muted for everything below it, on cream.
- ✅ Use `weight 900` exclusively for hero/screen titles; `weight 800` for card titles and section headers.
- ✅ Give Final-round content amber (`#C8900A` / `#FFF8E7`) treatment — it is visually distinct from other rounds.
- ✅ Use `PressableScale` (scale 0.96 on press) for all interactive cards.
- ✅ Use `SafeAreaView` with `edges={["top"]}` on a `redFill` background on every screen, with a cream scroll view — never assume safe area.

### Don't

- ❌ Don't use `rgba(255,255,255,x)` for text on cream backgrounds — it becomes invisible.
- ❌ Don't use pure black (`#000000`) anywhere — use ink (`#141414`) or panel (`#1E1E1E`).
- ❌ Don't use more than one accent color per screen. Red owns primary actions; green is only for success/live states; amber is only for finals.
- ❌ Don't put text on a gradient, and don't place dark text (`ink`, `muted`) on red — header text goes in the solid band, in white.
- ❌ Don't set `border-radius` below 12 px on any interactive element.
- ❌ Don't use `font-weight` below 600 for interactive labels, pill text, or metadata that needs to be scannable at glance.
- ❌ Don't add box-shadows to resting list cards — border is sufficient. The web hover shadow is the one exception.
- ❌ Don't use `rgba(255,255,255,0.08)` backgrounds on cream — they are invisible. Use `#FFFFFF` with a `line` border instead.
- ❌ Don't skip the 22 px section gap between major content blocks — visual breathing room is load-bearing.

---

## 8. Responsive Behavior

The **iOS and Android apps are phone-only** (React Native / Expo, `ios.supportsTablet: false`): they always use the phone layout. The **web build** adds a column of cards each time one more fits, and a navigation rail from 880px (§5 Columns). The phone layout targets:

| Target      | Width      | Notes                              |
| ----------- | ---------- | ---------------------------------- |
| Small phone | 320–374 px | Rare; 20 px gutters still hold     |
| Standard    | 375–390 px | Primary design target (iPhone 14)  |
| Large phone | 391–430 px | Extra whitespace absorbed by cards |

**Touch targets:**

- Minimum: 44 × 44 pt for all interactive elements.
- Card rows: minimum `padding: 18px` vertical for adequate touch area.
- Tab bar icons: system-managed, min 44 pt height.

**Safe areas:**

- Always `edges={["top"]}` on `SafeAreaView` — bottom is handled by the tab bar container. The
  Score tab is the exception: its pinned Start bar pads by the bottom inset of a provider of its
  own, inside the tab (§4 Score — Setup).
- Bottom content padding: 120 px (`paddingBottom: 120`) to clear the floating tab bar.

**Text scaling:**

- No explicit `allowFontScaling={false}` — respect system accessibility text size.
- Use `numberOfLines={1}` on card titles to prevent layout overflow at large text sizes.

---

## 9. Agent Prompt Guide

### Quick color reference

| Name       | Hex / Value            |
| ---------- | ---------------------- |
| Red        | `#C8102E`              |
| Red Dark   | `#970D25`              |
| Red Soft   | `#FDE8EC`              |
| Cream      | `#F7F4EF`              |
| Card       | `#FFFDFC`              |
| White      | `#FFFFFF`              |
| Line       | `#E5DED6`              |
| Ink        | `#141414`              |
| Muted      | `#7A7A7A`              |
| Green      | `#1F7A5A`              |
| Green Soft | `#E6F4EE`              |
| Shadow     | `rgba(103,18,31,0.14)` |
| Amber      | `#C8900A`              |
| Amber bg   | `#FFF8E7`              |

### Component prompts

**Screen header (red band):**

> "Use `ScreenHeader`: a full-width solid `#C8102E` band (`#B5142F` in dark), sized by its content, with 24px bottom corners and 12px 20px 24px padding. Inside: an optional white back link (arrow + 15px weight-600 label), a small uppercase eyebrow in `rgba(255,255,255,0.86)` 12px weight-800 with 1.5px letter-spacing, a 34px weight-900 white title, and a 14px `rgba(255,255,255,0.90)` subtitle. Everything below the band sits on the `#F7F4EF` cream canvas. On a screen with filters under the band (results), pass `compact`: a 28px title, 16px bottom padding. To keep the filters in reach while the results scroll, pin a second `ScreenHeader` with `collapsed` above them: a 52px red bar, white arrow and one-line 17px weight-800 title, shown once the band has scrolled away (no fade when reduce motion is on)."

**Competition list card:**

> "Create a card with `border-radius: 20px`, background `#FFFDFC`, `border: 1px solid #E5DED6`, `padding: 18px`. Title is `#141414` 18px weight-800. Secondary text is `#7A7A7A` 13px. Row layout with title flex-1 and right-aligned metadata."

**Match card with score:**

> "A header row: the phase in words on the left (`Poules 1`) and the localized date on the right (`sam. 17 janv.`), both `#7A7A7A` 12px weight-600; on the day of the match a green 'Today' pill replaces the date. Then two team rows, each with `paddingVertical: 8px`: a 16px slot, the team name `#141414` 15px flex-1, and one right-aligned 22px tabular-nums Barlow Condensed column per set, min width 24px, 12px apart, so `07/15 04/15` reads 7 4 against 15 15. The team that won more sets gets a green `#1F7A5A` check in the slot, name weight-800 and sets `#141414` Barlow Condensed Black; the other team name weight-600 and sets `#7A7A7A` Barlow Condensed Bold. No check when the score is missing (show a light `—`) or the sets are even. Rows separated by a 1px `#E5DED6` divider. No red anywhere in a regular match card; the Final keeps its amber phase label and round pill."

**Status pill:**

> "Render a pill with `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`. Use background `#F9D8DE` + text `#970D25` for warnings and forfeits, never for past dates. Use `#E6F4EE` + `#1F7A5A` for success/today."

**Round section divider:**

> "A horizontal row: two `flex: 1` lines of `1px solid #E5DED6`, flanking a center pill of background `#F7F4EF` border `1px solid #E5DED6` `border-radius: 20px` `padding: 6px 14px`. Inside the pill: an icon at 13px + uppercase label `#141414` weight-800 + muted count `#7A7A7A` weight-600."

**Section header (cream zone):**

> "Stack: uppercase eyebrow `#7A7A7A` 12px weight-800 +1.6px letter-spacing, title `#141414` 28px weight-800 −0.8px tracking, subtitle `#7A7A7A` 14px line-height 20px. All items have 4px gap."

### Iteration guide

1. **The band is the contract** — screen header text goes in the solid red band, in white; everything else sits on cream in ink/muted. Never put text on a gradient, and never let a screen's content height decide a text color.
2. **Red is earned** — one red element per visual hierarchy level. If two things compete for red, the primary action wins.
3. **`#F7F4EF` is not `#FFFFFF`** — always verify the cream background is warm, not neutral white.
4. **Borders replace shadows on cards** — add `1px solid #E5DED6`, remove `box-shadow` from list cards.
5. **Eyebrows are always `uppercase` + `letter-spacing ≥ 1.2 px`** — if you can't see them breathe, they're wrong.
6. **Weight 900 is for heroes** — section titles use weight 800. If a section title is weight 900, step it down.
7. **The Final round gets amber** — pill background `#FFF8E7`, text `#A86E00`, border `rgba(200,144,10,0.4)`. Do not skip this treatment for the Finale row.
8. **Bottom padding is 120 px** — the tab bar floats. Never clip scroll content.
