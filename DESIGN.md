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
    fontFamily: "System, -apple-system, Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: "0px"
  score:
    fontFamily: "System, -apple-system, Roboto, sans-serif"
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
- **Placeholder** (`#6E6E6E`): Placeholder text in input fields. Darker than Muted so it reaches 4.5:1 on White (5.1:1); `#97A89F` in the dark theme (6.1:1 on the dark White).

### Semantic

- **Green** (`#1F7A5A`): Success states, "today" date pills, confirmed status.
- **Green Soft** (`#E6F4EE`): Success pill background.
- **Shadow** (`rgba(103, 18, 31, 0.14)`): Elevation shadow — red-tinted for brand warmth.

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
| `--panel`       | `#1E1E1E`              | Dark inset on red backgrounds  |
| `--amber`       | `#C8900A`              | Finale/final round highlight   |
| `--amber-bg`    | `#FFF8E7`              | Finale pill background         |

---

## 3. Typography Rules

**Font families:**

- **System default** (SF Pro on iOS, Roboto on Android). No custom font is loaded — the system font at high weights provides the sporty, confident tone needed.
- Numeric data (scores, years) inherits the same family; `tabular-nums` / `font-variant-numeric: tabular-nums` is implied for score alignment.

**Scale and hierarchy:**

| Role              | Size | Weight | Line height | Letter spacing | Notes                              |
| ----------------- | ---- | ------ | ----------- | -------------- | ---------------------------------- |
| Screen title      | 34px | 900    | 1.1         | 0              | Main hero title per screen         |
| Hero title (card) | 28px | 900    | 1.1         | 0              | Featured card / detail hero        |
| Section title     | 28px | 800    | 1.15        | −0.8px         | Section header titles              |
| Card title        | 18px | 800    | 1.2         | 0              | Competition/specialty cards        |
| Card subtitle     | 17px | 800    | 1.2         | 0              | Picker card labels                 |
| Body              | 15px | 400    | 1.4         | 0              | General readable text              |
| Body strong       | 15px | 700    | 1.4         | 0              | Team names, links, footers         |
| Meta / secondary  | 14px | 400    | 1.43        | 0              | Subtitles, hero sub                |
| Meta strong       | 14px | 600    | 1.43        | 0              | Hero meta, card level text         |
| Eyebrow           | 12px | 800    | 1.2         | +1.4–1.6px     | Section labels, always `uppercase` |
| Score (large)     | 28px | 900    | 1.0         | 0              | Final match score                  |
| Score (normal)    | 22px | 900    | 1.0         | 0              | Match score                        |
| Score pending     | 20px | 300    | 1.0         | 0              | "—" placeholder score              |
| Phase chip        | 12px | 600    | 1.2         | 0              | Match phase label in footer        |
| Pill label        | 12px | 700    | 1.2         | 0              | Status pills                       |
| Round divider     | 13px | 800    | 1.2         | +0.8px         | Round section headers, `uppercase` |

**Principles:**

- Weight 900 ("Black") is reserved for titles only. Never use weight 900 on body text.
- Eyebrow text is always `uppercase` with generous letter-spacing (+1.2–1.6 px).
- All section-level headings use negative tracking (−0.8 px at 28 px) for density.
- Pending/empty states use weight 300 — intentionally light, to signal absence.

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
Hover (web):   lineStrong border, shadow 0 4px 16px (shadow token)
Focus (web):   2px solid red outline, 2px offset, keyboard focus only
```

### Interaction states (web)

Hover and keyboard focus exist on web only; iOS and Android render as before. The styles live in
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
Hover, back link:         underlined label
Focus ring:               2px solid red outline, 2px offset (rounded with the element). White,
                          with a 4px offset, for the back link on the red band
Mouse focus:              no ring. A click also focuses a Pressable on web, so the ring only
                          shows when the browser matches :focus-visible (keyboard focus)
Focus, text fields:       a 2px red edge instead of the browser outline, after a click too:
                          typing goes to the field however it was focused (Inputs — Text Field)
```

`PressableScale` is an `Animated` component, which cannot take a style callback: it tracks hover
and focus through `onHoverIn`/`onHoverOut` and `onFocus`/`onBlur` instead. It draws the hover
only when it carries the card's `style`: a bare wrapper around a styled child has no radius for
the shadow to follow.

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
Pressed:       scale(0.96) via PressableScale
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
Tile:      #FFFDFC (card), 1px solid #E5DED6 (line), 20px radius, 16px padding, content spread
           top to bottom, 8px gap; min height 96px for a season tile. Tiles of a row share its
           height
Eyebrow:   #262626 (text), 12px, weight 800, uppercase, +1.2px tracking, up to 3 lines: the
           name without its season ("CHAMPIONNAT CCAPB"). Text, not muted: it names the
           competition, and muted on card is 4.2:1
Season:    #141414 (ink), 22px, weight 900, tabular-nums, one line ("2025-2026")
```

- **One competition per season**: one tile per season, eyebrow and season as above.
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

### Cards — Match Card

```
Background:   #FFFFFF (played) / #FFFDFC (pending)
Border:       1px solid #E5DED6
Border-radius: 16px (normal) / 20px + 2px red border (Final)
Header:       14px side padding — phase in words left ("Poules 1": rounds.* label + phase
              number), localized date right ("sam. 17 janv."), both #7A7A7A 12px weight 600.
              Final: phase label in amber #C8900A. Today: a green StatusPill replaces the date.
Inner:        14px side padding, team rows with paddingVertical 8px
Team row:     16px winner slot | name + club (flex 1) | one score column per set
Divider:      1px solid #E5DED6 between team rows
Sets:         one column per set ("07/15 04/15" → 7 4 against 15 15), 22px (28px Final),
              right-aligned, min width 30px (38px Final), 12px apart, tabular-nums
Winner:       team that won more sets — green #1F7A5A Check (16px, stroke 3) in the slot,
              name #141414 weight 800, sets #141414 weight 900
Loser:        name #141414 weight 600, sets #7A7A7A weight 400
No winner:    score missing or sets even — no Check, names and sets #141414 weight 700
Score pending: "—", #7A7A7A, 20px, weight 300
No red:       a regular match card carries no red. The Final keeps its amber round pill,
              amber phase label and 2px red border.
Bracket node: same team rows at 14px names, 17px sets (22px Final), min width 24px (30px
              Final), no header
Grid:         web, from two columns (§5 Columns): one card per grid column, in a `CardGrid`.
              Each card fills its `flex: 1` cell, so the cards of a row share its height and a
              short last row keeps its cards at the same width. Round dividers span the whole
              results column
Interaction:  none: a match card is not pressable, so it has no hover or focus state
```

On a phone, the bracket (`BracketView`) is a row of round columns one card wide (350px),
connected by a chevron, that scrolls sideways and bleeds over the gutter.

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

The knockout rounds come first: they are what a reader looks for, and they are short. Pools
are not a knockout bracket, and their 18 or 20 matches as a column left the later rounds empty.

### Status Pills

| Tone  | Background | Text      | Usage                  |
| ----- | ---------- | --------- | ---------------------- |
| red   | `#F9D8DE`  | `#970D25` | Warnings, forfeits     |
| green | `#E6F4EE`  | `#1F7A5A` | Today, live, confirmed |
| dark  | `#262626`  | `#FFFFFF` | Finals, completed      |
| soft  | `#EFE8DE`  | `#5D5145` | Neutral / upcoming     |
| amber | `#FFF3DC`  | `#8A5E00` | Semi-final, attention  |

Shape: `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`.

A past date is not a warning: match cards show no pill for a played match, only the green "Today"
pill on the day of the match.

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

### Screen Header (red band)

`ScreenHeader` (`src/components/ScreenHeader.tsx`): the one header for every screen.

```
Background:   redFill, solid, full width, sized by its content
Corners:      24px bottom-left and bottom-right (rounded.hero), square top
Padding:      12px top, 20px sides, 24px bottom; 16px between back link and text
Back link:    optional, ArrowLeft 20px + label, #FFFFFF 15px weight 600
Eyebrow:      optional, onRedSoft, 12px, weight 800, uppercase, +1.5px tracking
Title:        #FFFFFF, 34px, weight 900, line-height 37px, accessibilityRole "header"
Subtitle:     optional, onRedStrong, 14px, line-height 20px
Trailing:     optional slot right of the text, 16px gap (the About logo, an action button)
Loading:      white spinner in place of the title and subtitle
Compact:      `compact` prop, for a screen with filters under the band (results): title 28px
              (Hero title), line-height 31px; 16px bottom padding, 12px between back link and text
Width:        always full width. On a grid screen its content keeps the 20px gutter, like the
              grid below. A text screen passes its text column (`column` prop), and the
              band's content keeps to it
Back link:    hover underlines the label; keyboard focus draws a 2px white outline, 4px offset
              (a red ring would not show on the band)
```

| Pair (on redFill)                  | Light (`#C8102E`) | Dark (`#B5142F`) |
| ---------------------------------- | ----------------- | ---------------- |
| Title, back link (`#FFFFFF`)       | 5.88:1            | 6.76:1           |
| Subtitle (onRedStrong, 0.90 white) | 4.95:1            | 5.68:1           |
| Eyebrow (onRedSoft, 0.86 / 0.80)   | 4.61:1            | 4.73:1           |

### Section Header

`SectionHeader` (`src/components/SectionHeader.tsx`): section titles on cream, below the band.

```
Eyebrow:  #7A7A7A, 12px, weight 800, uppercase, +1.6px tracking
Title:    #141414, 28px, weight 800, −0.8px tracking
Subtitle: #7A7A7A, 14px, weight 400, line-height 20px
Gap:      4px between stack items
```

### Navigation / Tab Bar

Expo Router tabs. iOS and Android use `src/app/(tabs)/_layout.tsx`; web uses
`src/app/(tabs)/_layout.web.tsx`, which Expo Router picks over it on web only. `index` and `slot`
stay hidden (`href: null`) in both.

```
Background:    #FFFFFF
Border top:    1px solid #E9E0D6
Active tint:   #C8102E
Inactive tint: #B8B1AA
Label:         12px, weight 700, paddingBottom 8px
```

The bottom bar on iOS, Android, and on web until two columns fit beside the rail
(`RAIL_MIN_WIDTH`, 880px, §5). From there, web shows a navigation rail on the left instead:

```
Rail:          128px wide (RAIL_WIDTH), full height, tabBar background, 1px tabBarBorder
               right border, 8px side padding. React Navigation's left tab bar, material variant
Logo:          KanchaLogo 48px, centered, 20px from the top, 16px above the tabs; on-light in
               the light theme, on-dark in the dark one. Decorative: it sits on the tab bar's
               background layer
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
Field:     #FFFFFF (white), 1px solid #E5DED6 (line), 16px radius, min height 44px, 16px sides
Value:     #141414 (ink), 15px, weight 700, one line with an ellipsis
Chevron:   ChevronDown 18px, #7A7A7A (muted), right, 8px gap
Pressed:   #FFFDFC (card)
List:      a sheet from the bottom of the screen: #FFFFFF, 24px top corners, scrim in shadow
           (rgba(103,18,31,0.14)), uppercase muted title (12px, weight 800, +1.5px tracking)
Rows:      min height 48px, 16px sides, full name #141414 15px weight 600; the current one
           weight 800 with an ink Check (18px, stroke 3). A row or the scrim closes the sheet
Web:       hover and focus as cards (lineStrong border, shadow, red ring); a hovered row turns
           cream like a pressed one. From two columns the sheet is the text column (752px) at
           most, centered
```

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
Wrap:      `wrap` prop, from two columns (web): the chips flow onto several lines inside the
           gutter, with no scrolling, no bleed and no fade
```

### Segmented Control

`SegmentedControl` (`src/components/SegmentedControl.tsx`): switches between views of the same
content, such as Liste / Tableau / Classement.

```
Track:     #E5DED6 (line), pill radius, 3px padding, 2px between segments, 44px tall
Segment:   flex 1, min height 38px, 14px icon + 13px label, centered, pill radius
Inactive:  no fill, #262626 (text), weight 700
Active:    #FFFFFF (white) segment, 1px #CBBFB2 (lineStrong) ring and a 0 1px 4px shadow
           (shadow), #141414 (ink) icon and label, weight 700
Icons:     shown only when each segment is 124px wide or more (a 382px track for three),
           read from the track's width, not the window's: narrower, the longest label
           ("Clasificación", es) no longer fits beside its icon. On the results screen, labels
           only at 360, 390, 768 and 1280px wide; icons at 1024 and 1440px
No red:    picking a view is not an action
Web:       hover tints an inactive segment lineStrong; keyboard focus draws the red ring
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
Done:      a dark StatusPill ("Terminé") at the end of the row once every match has a score
Grid:      from two columns (web), the row moves to the filters: under the segmented control in
           the filter column, on its own line in the filter bar
```

### Results screen in the grid

On web, from two columns (§5 Columns). On a phone the screen keeps its order: filters,
progress, results.

From three columns, the list and the ranking give the filters the first grid column:

```
Filters:   one cell wide, 12px from the results: SelectField, FilterChips (wrap),
           SegmentedControl, ResultsProgress. position: sticky, 16px from the top: they stay in
           view while the matches scroll
Results:   the other columns: the match grid or the ranking cards, one card per column
```

With two columns, and always for the bracket, which needs the whole width to fit its rounds,
the filters sit in a bar above the results, and the results get every column:

```
Filter bar: one wrapping row, 12px gap: SelectField (a cell wide), FilterChips (wrap, the
            rest of the line, 200px at least), SegmentedControl (a cell wide). ResultsProgress
            on its own line under them. When the line is too short, the segmented control
            drops to a second line
Results:    the match grid, the ranking cards or the fit bracket, over every column
```

Switching to the bracket moves the filters from the column to the bar.

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
- **Grid screens** (leagues, competitions, results, ranking, player search, player): their
  lists of cards go through `CardGrid` (`src/components/CardGrid.tsx`), with `columns` from
  `useWebLayout()`. In one column, `CardGrid` is the list as it was. Season tiles are half a
  card: two per column. Nothing caps the width: a wider window gets more columns.
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
Scrolling:  the band scrolls with the content; the red top edge stays behind the status bar
```

The band holds the screen header only. Section titles, cards, loaders and empty or error states
sit on cream below it.

---

## 6. Depth & Elevation

| Level | Surface                    | Method                                               |
| ----- | -------------------------- | ---------------------------------------------------- |
| 0     | Cream screen bg            | `#F7F4EF` — no border, no shadow                     |
| 1     | List card                  | `#FFFDFC` + `1px solid #E5DED6`                      |
| 2     | Match card (played)        | `#FFFFFF` + `1px solid #E5DED6`                      |
| 3     | Header band, featured card | `#C8102E` — color itself signals prominence          |
| 4     | Final match card           | `#FFFFFF` + `2px solid #C8102E`                      |
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

- Always `edges={["top"]}` on `SafeAreaView` — bottom is handled by the tab bar container.
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

> "Use `ScreenHeader`: a full-width solid `#C8102E` band (`#B5142F` in dark), sized by its content, with 24px bottom corners and 12px 20px 24px padding. Inside: an optional white back link (arrow + 15px weight-600 label), a small uppercase eyebrow in `rgba(255,255,255,0.86)` 12px weight-800 with 1.5px letter-spacing, a 34px weight-900 white title, and a 14px `rgba(255,255,255,0.90)` subtitle. Everything below the band sits on the `#F7F4EF` cream canvas. On a screen with filters under the band (results), pass `compact`: a 28px title, 16px bottom padding."

**Competition list card:**

> "Create a card with `border-radius: 20px`, background `#FFFDFC`, `border: 1px solid #E5DED6`, `padding: 18px`. Title is `#141414` 18px weight-800. Secondary text is `#7A7A7A` 13px. Row layout with title flex-1 and right-aligned metadata."

**Match card with score:**

> "A header row: the phase in words on the left (`Poules 1`) and the localized date on the right (`sam. 17 janv.`), both `#7A7A7A` 12px weight-600; on the day of the match a green 'Today' pill replaces the date. Then two team rows, each with `paddingVertical: 8px`: a 16px slot, the team name `#141414` 15px flex-1, and one right-aligned 22px tabular-nums column per set, min width 30px, 12px apart, so `07/15 04/15` reads 7 4 against 15 15. The team that won more sets gets a green `#1F7A5A` check in the slot, name weight-800 and sets `#141414` weight-900; the other team name weight-600 and sets `#7A7A7A` weight-400. No check when the score is missing (show a light `—`) or the sets are even. Rows separated by a 1px `#E5DED6` divider. No red anywhere in a regular match card; the Final keeps its amber phase label and round pill."

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
