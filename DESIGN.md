# Design System — Kancha Mobile App

> Pelota basque tournament manager. Warm cream canvas, Basque red identity, card-based clarity.

---

## 1. Visual Theme & Atmosphere

**Mood:** Disciplined and warm. Kancha feels like a well-run sports federation — authoritative but approachable. The UI evokes the materiality of a pelota fronton: cream stone, deep red banners, crisp white lines.

**Core philosophy:**

- A **cream white canvas** (`#F7F4EF`) grounds every screen — never pure white, never cold.
- A **Basque red** (`#C8102E`) is the single dominant brand color. It drives the hero zone, primary actions, and featured content. It earns every pixel it occupies.
- **Dark ink** (`#141414`) for headings and body text. Near-black, not pure black — warm and legible.
- **Elevation through cards**, not shadows alone. White or cream cards on a cream background are separated by a warm `line` border (`#E5DED6`).
- The top of every screen runs a **red-to-cream linear gradient** (0 → 300 px), creating a natural hero zone without hard edges.

**Key characteristics:**

- Mobile-first. 20 px horizontal gutters, 24 px card radii, generous touch targets (min 44 pt).
- **No decorative imagery** — the typography and color do all the expressive work.
- **Phase-driven layouts**: hero section (red zone) → section header (cream transition) → card list (cream field).
- Rounded, confident geometry. No sharp corners below 12 px radius.

---

## 2. Color Palette & Roles

### Brand & Primary

- **Red** (`#C8102E`): Primary brand color. Hero card backgrounds, CTA buttons, score text, active tab indicator. Use at full opacity only — never tint arbitrarily.
- **Red Dark** (`#970D25`): Darker red for pressed states, gradient bottom stop, error text on light surfaces.
- **Red Soft** (`#FDE8EC`): Light pink tint for error state backgrounds, score badge chips on light cards.

### Canvas & Surfaces

- **Cream** (`#F7F4EF`): Default page/screen background. Warm off-white — never substitute with `#FFFFFF`.
- **Card** (`#FFFDFC`): Slightly warmer than cream; used for list cards sitting on cream to create a 1-step elevation.
- **White** (`#FFFFFF`): Match cards, modal surfaces, high-contrast inset content.
- **Line** (`#E5DED6`): Border and divider color. Warm greige — matches the cream family.

### Ink & Text

- **Ink** (`#141414`): Headings, card titles, primary body text on light backgrounds.
- **Text** (`#262626`): Body text, slightly softer than Ink.
- **Muted** (`#7A7A7A`): Secondary text, eyebrow labels, metadata, placeholder text.

### Semantic

- **Green** (`#1F7A5A`): Success states, "today" date pills, confirmed status.
- **Green Soft** (`#E6F4EE`): Success pill background.
- **Shadow** (`rgba(103, 18, 31, 0.14)`): Elevation shadow — red-tinted for brand warmth.

### Dark Surfaces (panels, hero overlays)

- **Panel** (`#1E1E1E`): Dark inset surfaces within red hero cards (e.g. year/level badge).
- `#161616`: Alternate deep dark — used for featured info chips inside red cards.

### Reference table

| Role           | Value                  | Usage                              |
| -------------- | ---------------------- | ---------------------------------- |
| `--red`        | `#C8102E`              | Brand, CTAs, hero backgrounds      |
| `--red-dark`   | `#970D25`              | Gradient stop, pressed, error text |
| `--red-soft`   | `#FDE8EC`              | Error bg, score chips              |
| `--cream`      | `#F7F4EF`              | Screen background                  |
| `--card`       | `#FFFDFC`              | List card background               |
| `--white`      | `#FFFFFF`              | Match cards, modals                |
| `--line`       | `#E5DED6`              | Borders, dividers                  |
| `--ink`        | `#141414`              | Headings, titles                   |
| `--text`       | `#262626`              | Body text                          |
| `--muted`      | `#7A7A7A`              | Secondary text, metadata           |
| `--green`      | `#1F7A5A`              | Success, live/today indicator      |
| `--green-soft` | `#E6F4EE`              | Success pill background            |
| `--shadow`     | `rgba(103,18,31,0.14)` | Elevated card shadow               |
| `--panel`      | `#1E1E1E`              | Dark inset on red backgrounds      |
| `--amber`      | `#C8900A`              | Finale/final round highlight       |
| `--amber-bg`   | `#FFF8E7`              | Finale pill background             |

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
Usage:        Create/add action button within red hero zone
```

### Cards — Competition / Picker

```
Background:   #FFFDFC
Border:       1px solid #E5DED6
Border-radius: 20px
Padding:       18px
Shadow:        none (border provides separation)
Title:         #141414, 17–18px, weight 800
Meta:          #7A7A7A, 13px, weight 400
```

### Cards — Featured / Hero Card

```
Background:   #C8102E
Border-radius: 24px
Padding:       20–22px
Title:         #FFFFFF, 26–28px, weight 900
Eyebrow:       rgba(255,255,255,0.7), 12px, weight 800, uppercase
Sub panel:     #161616 bg, #FFFFFF text — inset dark chip for metadata
Footer:        white text + ChevronRight icon, space-between layout
```

### Cards — Match Card

```
Background:   #FFFFFF (played) / #FFFDFC (pending)
Border:       1px solid #E5DED6
Border-radius: 16px (normal) / 20px + 2px red border (Final)
Inner:        14px padding, team rows with paddingVertical 8px
Divider:      1px solid #E5DED6 between team rows
Footer:       rgba(0,0,0,0.02) bg + 1px top border — holds StatusPill + phase chip
Score:        #C8102E, 22–28px, weight 900
Score pending: #7A7A7A, 20px, weight 300
```

### Status Pills

| Tone  | Background | Text      | Usage                  |
| ----- | ---------- | --------- | ---------------------- |
| red   | `#F9D8DE`  | `#970D25` | Past dates, warnings   |
| green | `#E6F4EE`  | `#1F7A5A` | Today, live, confirmed |
| dark  | `#262626`  | `#FFFFFF` | Finals, completed      |
| soft  | `#EFE8DE`  | `#5D5145` | Neutral / upcoming     |
| amber | `#FFF3DC`  | `#8A5E00` | Semi-final, attention  |

Shape: `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`.

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

### Section Header

```
Eyebrow:  #7A7A7A, 12px, weight 800, uppercase, +1.6px tracking
Title:    #141414, 28px, weight 800, −0.8px tracking
Subtitle: #7A7A7A, 14px, weight 400, line-height 20px
Gap:      4px between stack items
```

### Navigation / Tab Bar

```
Background:    #FFFFFF
Border top:    1px solid #E9E0D6
Active tint:   #C8102E
Inactive tint: #B8B1AA
Label:         12px, weight 700, paddingBottom 8px
```

### Context Badges (breadcrumb)

```
Background:   #FFFFFF
Text:         #C8102E, 13px, weight 800
Border-radius: 20px
Padding:       8px 16px
Usage:        Specialty/category labels on detail screens
```

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
- **Single-column layout** only — no multi-column grids on mobile.
- **Hero zone:** Top 0–300 px of screen is the red gradient zone. Text here uses white and `rgba(255,255,255,0.78–0.82)` tones. Below 230–300 px, the canvas is cream and text must switch to ink/muted.

### Background gradient architecture

```
Position: absolute, top: 0, left: 0, right: 0
Height:   300px
Gradient: #C8102E → #970D25 → #F7F4EF
Stops:    0% / 55% / 100%
Effect:   Smooth red-to-cream fade, no hard edge
```

Decorative circles reinforce the gradient zone:

- Circle 1: `160×160px`, `top: 70, right: −20`, `rgba(255,255,255,0.08)`
- Circle 2: `120×120px`, `top: 120, left: −35`, `rgba(255,255,255,0.06)`

---

## 6. Depth & Elevation

| Level | Surface             | Method                                               |
| ----- | ------------------- | ---------------------------------------------------- |
| 0     | Cream screen bg     | `#F7F4EF` — no border, no shadow                     |
| 1     | List card           | `#FFFDFC` + `1px solid #E5DED6`                      |
| 2     | Match card (played) | `#FFFFFF` + `1px solid #E5DED6`                      |
| 3     | Featured hero card  | `#C8102E` — color itself signals prominence          |
| 4     | Final match card    | `#FFFFFF` + `2px solid #C8102E`                      |
| 5     | Logo / FAB button   | Red bg + `rgba(103,18,31,0.14)` shadow, `0 6px 16px` |

**Shadow philosophy:** Shadows are red-tinted (`rgba(103,18,31,0.14)`) — never cool-gray (`rgba(0,0,0,0.x)`). This ties elevation to the brand color and keeps the warm palette coherent. Shadows are used sparingly — only on the About screen logo and action buttons — not on list cards.

**Depth through border color, not shadow stacking.** The `line` color (`#E5DED6`) is warm enough to separate white cards from cream without needing elevation.

---

## 7. Do's and Don'ts

### Do

- ✅ Use `#F7F4EF` (cream) as the page/screen background — not `#FFFFFF` or `#F5F5F5`.
- ✅ Limit red to purposeful elements: hero cards, CTAs, scores, active states. One red element per screen hierarchy level.
- ✅ Always use uppercase + letter-spacing (+1.4–1.6 px) for eyebrow labels.
- ✅ Use `line` (`#E5DED6`) as the universal border/divider color on light surfaces.
- ✅ Switch text to ink/muted when content scrolls below the 230–300 px red gradient zone.
- ✅ Use `weight 900` exclusively for hero/screen titles; `weight 800` for card titles and section headers.
- ✅ Give Final-round content amber (`#C8900A` / `#FFF8E7`) treatment — it is visually distinct from other rounds.
- ✅ Use `PressableScale` (scale 0.96 on press) for all interactive cards.
- ✅ Use `SafeAreaView` with `edges={["top"]}` on every screen — never assume safe area.

### Don't

- ❌ Don't use `rgba(255,255,255,x)` for text on cream backgrounds — it becomes invisible.
- ❌ Don't use pure black (`#000000`) anywhere — use ink (`#141414`) or panel (`#1E1E1E`).
- ❌ Don't use more than one accent color per screen. Red owns primary actions; green is only for success/live states; amber is only for finals.
- ❌ Don't place dark text (`ink`, `muted`) over the red hero gradient without a card container — use white text instead.
- ❌ Don't set `border-radius` below 12 px on any interactive element.
- ❌ Don't use `font-weight` below 600 for interactive labels, pill text, or metadata that needs to be scannable at glance.
- ❌ Don't add box-shadows to list cards — border is sufficient.
- ❌ Don't use `rgba(255,255,255,0.08)` backgrounds on cream — they are invisible. Use `#FFFFFF` with a `line` border instead.
- ❌ Don't skip the 22 px section gap between major content blocks — visual breathing room is load-bearing.

---

## 8. Responsive Behavior

Kancha is a **mobile-only native app** (React Native / Expo). No tablet layout exists. The design system targets:

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

**Hero screen header (red zone):**

> "Build a hero section with a small uppercase eyebrow label in `rgba(255,255,255,0.78)` 12px weight-800 with 1.5px letter-spacing, a 34px weight-900 white title, and a 14px `rgba(255,255,255,0.82)` subtitle. The background is a linear gradient from `#C8102E` to `#970D25` to `#F7F4EF` over 300px."

**Competition list card:**

> "Create a card with `border-radius: 20px`, background `#FFFDFC`, `border: 1px solid #E5DED6`, `padding: 18px`. Title is `#141414` 18px weight-800. Secondary text is `#7A7A7A` 13px. Row layout with title flex-1 and right-aligned metadata."

**Match card with score:**

> "Two team rows, each with `paddingVertical: 8px`, team name `#141414` 15px weight-700 flex-1, score `#C8102E` 22px weight-900. Rows separated by a 1px `#E5DED6` divider. Below: a footer strip `rgba(0,0,0,0.02)` background, `border-top: 1px solid #E5DED6`, holding a StatusPill and a 12px muted phase chip."

**Status pill:**

> "Render a pill with `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`. Use background `#F9D8DE` + text `#970D25` for past/warning. Use `#E6F4EE` + `#1F7A5A` for success/today."

**Round section divider:**

> "A horizontal row: two `flex: 1` lines of `1px solid #E5DED6`, flanking a center pill of background `#F7F4EF` border `1px solid #E5DED6` `border-radius: 20px` `padding: 6px 14px`. Inside the pill: an icon at 13px + uppercase label `#141414` weight-800 + muted count `#7A7A7A` weight-600."

**Section header (cream zone):**

> "Stack: uppercase eyebrow `#7A7A7A` 12px weight-800 +1.6px letter-spacing, title `#141414` 28px weight-800 −0.8px tracking, subtitle `#7A7A7A` 14px line-height 20px. All items have 4px gap."

### Iteration guide

1. **The gradient zone is the contract** — if your content starts at Y > 230 px, switch from white to ink text. Never assume the red extends beyond 300 px.
2. **Red is earned** — one red element per visual hierarchy level. If two things compete for red, the primary action wins.
3. **`#F7F4EF` is not `#FFFFFF`** — always verify the cream background is warm, not neutral white.
4. **Borders replace shadows on cards** — add `1px solid #E5DED6`, remove `box-shadow` from list cards.
5. **Eyebrows are always `uppercase` + `letter-spacing ≥ 1.2 px`** — if you can't see them breathe, they're wrong.
6. **Weight 900 is for heroes** — section titles use weight 800. If a section title is weight 900, step it down.
7. **The Final round gets amber** — pill background `#FFF8E7`, text `#A86E00`, border `rgba(200,144,10,0.4)`. Do not skip this treatment for the Finale row.
8. **Bottom padding is 120 px** — the tab bar floats. Never clip scroll content.
