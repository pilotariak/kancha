# Design system reference

## Color tokens

| Token          | Value                  | Usage                              |
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

## Typography scale

| Role              | Size  | Weight | Line height | Letter spacing | Notes                              |
| ----------------- | ----- | ------ | ----------- | -------------- | ---------------------------------- |
| Screen title      | 34 px | 900    | 1.1         | 0              | Main hero title per screen         |
| Hero title (card) | 28 px | 900    | 1.1         | 0              | Featured card / detail hero        |
| Section title     | 28 px | 800    | 1.15        | −0.8 px        | Section header titles              |
| Card title        | 18 px | 800    | 1.2         | 0              | Competition/specialty cards        |
| Card subtitle     | 17 px | 800    | 1.2         | 0              | Picker card labels                 |
| Body              | 15 px | 400    | 1.4         | 0              | General readable text              |
| Body strong       | 15 px | 700    | 1.4         | 0              | Team names, links, footers         |
| Meta / secondary  | 14 px | 400    | 1.43        | 0              | Subtitles, hero sub                |
| Meta strong       | 14 px | 600    | 1.43        | 0              | Hero meta, card level text         |
| Eyebrow           | 12 px | 800    | 1.2         | +1.4–1.6 px    | Section labels, always `uppercase` |
| Score (large)     | 28 px | 900    | 1.0         | 0              | Final match score                  |
| Score (normal)    | 22 px | 900    | 1.0         | 0              | Match score                        |
| Score pending     | 20 px | 300    | 1.0         | 0              | "—" placeholder score              |
| Phase chip        | 12 px | 600    | 1.2         | 0              | Match phase label in footer        |
| Pill label        | 12 px | 700    | 1.2         | 0              | Status pills                       |
| Round divider     | 13 px | 800    | 1.2         | +0.8 px        | Round section headers, `uppercase` |

Font families: SF Pro (iOS), Roboto (Android). No custom font is loaded.

## Status pills

| Tone    | Background | Text      | Usage                  |
| ------- | ---------- | --------- | ---------------------- |
| `red`   | `#F9D8DE`  | `#970D25` | Past dates, warnings   |
| `green` | `#E6F4EE`  | `#1F7A5A` | Today, live, confirmed |
| `dark`  | `#262626`  | `#FFFFFF` | Finals, completed      |
| `soft`  | `#EFE8DE`  | `#5D5145` | Neutral / upcoming     |
| `amber` | `#FFF3DC`  | `#8A5E00` | Semi-final, attention  |

Shape: `border-radius: 9999px`, `padding: 6px 10px`, `font-size: 12px`, `font-weight: 700`.

## Layout constants

| Property             | Value  |
| -------------------- | ------ |
| Horizontal gutter    | 20 px  |
| Card border-radius   | 20 px  |
| Hero border-radius   | 24 px  |
| Minimum touch target | 44 pt  |
| Hero gradient height | 300 px |
