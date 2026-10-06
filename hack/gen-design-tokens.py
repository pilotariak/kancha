#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (C) Nicolas Lamirault <nicolas.lamirault@gmail.com>
# SPDX-License-Identifier: Apache-2.0
"""Generate the color palettes in src/constants/colors.ts from DESIGN.md.

DESIGN.md frontmatter is the single source of truth for every design token.
This script renders the `KanchaColorsLight` and `KanchaColorsDark` object
literals of src/constants/colors.ts from those tokens, so the TypeScript
palette can never drift from the documented design system.

Light values come from the standard `colors:` block plus the translucent
`meta.cssExtras` values; the full dark palette lives in `meta.darkColors`
(the design.md standard is single-scheme, so the dark variant is carried
there, keyed by its TypeScript Palette field name).

Usage:
    gen-design-tokens.py            # rewrite src/constants/colors.ts in place
    gen-design-tokens.py --check    # exit 1 if colors.ts is out of date (CI)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError:
    sys.exit("error: PyYAML is required (pip install pyyaml)")

ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / "DESIGN.md"
COLORS = ROOT / "src" / "constants" / "colors.ts"

# Source of each Palette field's LIGHT value in the frontmatter:
#   ("c", key) -> colors[key]           ("x", key) -> meta.cssExtras[key]
# The DARK value is always meta.darkColors[field] (keyed by the field name).
Source = tuple[str, str]

# Order matches the `Palette` type in colors.ts — it is the emitted field order.
FIELDS: list[tuple[str, Source]] = [
    ("red", ("c", "primary")),
    ("redDark", ("c", "brandDark")),
    ("redSoft", ("c", "brandSoft")),
    ("white", ("c", "surfaceElevated")),
    ("cream", ("c", "background")),
    ("ink", ("c", "textPrimary")),
    ("text", ("c", "text")),
    ("muted", ("c", "textMuted")),
    ("line", ("c", "border")),
    ("card", ("c", "surface")),
    ("panel", ("c", "panel")),
    ("green", ("c", "success")),
    ("greenSoft", ("c", "successSoft")),
    ("shadow", ("x", "shadow")),
    ("amber", ("c", "championship")),
    ("amberBg", ("c", "championshipSoft")),
    ("onRedStrong", ("x", "on-red-strong")),
    ("onRedSoft", ("x", "on-red-soft")),
    ("heroCircleOne", ("x", "hero-circle-one")),
    ("heroCircleTwo", ("x", "hero-circle-two")),
    ("tabBar", ("c", "tabBar")),
    ("tabBarBorder", ("c", "tabBarBorder")),
    ("tabIconInactive", ("c", "tabIconInactive")),
]

LIGHT_RE = re.compile(r"(export const KanchaColorsLight: Palette = \{\n).*?(\n\};)", re.S)
DARK_RE = re.compile(r"(export const KanchaColorsDark: Palette = \{\n).*?(\n\};)", re.S)


def load_tokens() -> dict:
    text = DESIGN.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        sys.exit("error: DESIGN.md has no YAML frontmatter")
    return yaml.safe_load(m.group(1))


def resolve_light(tokens: dict, field: str, source: Source) -> str:
    kind, key = source
    if kind == "c":
        value = tokens.get("colors", {}).get(key)
    elif kind == "x":
        value = tokens.get("meta", {}).get("cssExtras", {}).get(key)
    else:  # pragma: no cover
        value = None
    if value is None:
        sys.exit(f"error: light token for '{field}' ({source}) not found in DESIGN.md")
    return str(value)


def resolve_dark(tokens: dict, field: str) -> str:
    value = tokens.get("meta", {}).get("darkColors", {}).get(field)
    if value is None:
        sys.exit(f"error: dark token for '{field}' not found in meta.darkColors")
    return str(value)


def render_body(entries: list[tuple[str, str]]) -> str:
    """Render the object literal body: two-space indented `key: "value",` lines."""
    return "\n".join(f'  {field}: "{value}",' for field, value in entries)


def rewrite(text: str, pattern: re.Pattern[str], body: str, label: str) -> str:
    if not pattern.search(text):
        sys.exit(f"error: no {label} palette block found in {COLORS}")
    return pattern.sub(lambda m: f"{m.group(1)}{body}{m.group(2)}", text, count=1)


def main() -> int:
    check = "--check" in sys.argv[1:]
    tokens = load_tokens()

    light = [(f, resolve_light(tokens, f, src)) for f, src in FIELDS]
    dark = [(f, resolve_dark(tokens, f)) for f, _ in FIELDS]

    old = COLORS.read_text()
    updated = rewrite(old, LIGHT_RE, render_body(light), "light")
    updated = rewrite(updated, DARK_RE, render_body(dark), "dark")

    rel = COLORS.relative_to(ROOT)
    if check:
        if updated != old:
            sys.stderr.write(
                f"error: {rel} is out of date with DESIGN.md tokens.\n"
                "       run `make tokens` and commit the result.\n"
            )
            return 1
        print(f"✅ {rel} matches DESIGN.md")
        return 0

    if updated != old:
        COLORS.write_text(updated)
        print(f"✅ wrote {rel} from DESIGN.md")
    else:
        print(f"✅ {rel} already up to date")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
