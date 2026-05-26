# Design philosophy

## The fronton metaphor

Kancha's visual design is grounded in the materiality of a pelota fronton: cream stone walls, deep red banners on the front wall, crisp white lines on the court. These physical references are translated into abstract tokens — never literal imagery — so the UI feels culturally rooted without being illustrative.

The name _kancha_ is the Basque word for the playing court itself. The app is meant to feel like entering the fronton: disciplined, warm, focused on the game.

## Cream, not white

The default screen background is `#F7F4EF` (cream), never pure white. Pure white reads as cold and clinical. The cream canvas is warm, slightly aged — like stone — and provides a neutral field that makes the Basque red read as intentional and bold rather than aggressive.

## Red earns its place

`#C8102E` (Basque red) is used sparingly and purposefully. It drives the hero zone at the top of every screen, primary CTAs, active tab indicators, and score text. It is never tinted, diluted, or used as a background for body text. The rule is: red appears where something demands immediate attention or carries primary brand meaning.

## Phase-driven layout

Every screen follows the same compositional logic: a red hero zone (0–300 px gradient), a cream transition, then a cream card field. This three-phase structure creates rhythm and predictability. Users orient themselves immediately because the visual language is consistent across every screen.

## Typography does the expressive work

No decorative imagery, no custom fonts. Weight 900 ("Black") at large sizes provides the sporty, confident tone. Eyebrow labels in uppercase with wide tracking signal hierarchy. The type scale is generous — 34 px screen titles, 28 px section titles — because the content (teams, scores, brackets) benefits from clarity at a glance.

## Elevation through borders, not shadows

Cards are separated from the cream background by a warm `#E5DED6` border rather than shadows. This keeps the UI flat and legible. Shadows appear only on elevated surfaces (modals, FABs) where z-axis depth needs to be communicated.
