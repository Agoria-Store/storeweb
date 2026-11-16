# Design

A calm, light storefront built around one hero object: a detailed 3D gold Bitcoin coin. Palette is graphite and gold: stone ground, ink actions, gold reserved for value. Craft bar: Apple product pages, Stripe, Gumroad / Lemon Squeezy. Tokens live in `apps/site/src/styles/global.css`.

## Color

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | #F5F4F0 | Page background (warm stone), nav |
| `--surface` | #FFFFFF | Cards |
| `--surface-2` | #EEEBE4 | Inset panels, filter track |
| `--ink` | #16150F | Text, dark CTA card |
| `--muted` | #5A564C | Secondary text |
| `--line` | #E2DED4 | Dividers |
| `--primary` | #16150F | Primary buttons (ink), active states, focus ring |
| `--primary-soft` | #EFE7D6 | Gold tint behind numbers/icons |
| `--gold` | #C8902E | Accent: coin glow, illustration highlights |
| `--money` | #7A4F0E | Prices (deep gold) |
| `--tether` | #3D7A5F | The USDT dot only |
| `--sun` | #ECD29A | "Save X%" badges only |
| `--tg` / `--tg-soft` | #1D8FD1 / #E3F3FC | Telegram delivery only |

## Type

Headings: Bricolage Grotesque Variable (opsz 96 for h1/h2, 24 for h3), weight 600-700, tracking -0.035 to -0.04em. Body and UI: Geist Variable.

## Illustrations

`Illustration.astro` draws every product thumbnail as SVG geometry (no picture-style drawings):
- Courses cycle through scenes: `candles` (candlestick chart + trend), `network` (coin with orbiting nodes), `wave` (layered curves).
- Bundles: `layers` (stacked isometric slabs).
- Chapters/videos: quiet grey tile with a large number and a small motif from the parent course's scene.
A real `thumbnailUrl` always replaces the illustration.

## Components

- Cards: white, 16px radius, one soft shadow; hover lifts 4px. Footer row shows delivery and "View course" in primary.
- Buttons: pill. Primary ink (#16150F), Secondary white with border, `.small` for inline actions.
- Prices `.price` in deep gold with "USDT"; savings in a pale gold `.badge-save`, always computed from catalog data.

## Motion

- Hero layout: below 1024px centred and stacked; at 1024px+ two columns (copy left, coin right) filling the first screen (min-height 100svh minus nav).
- Hero coin: SVG coin renders immediately. The three.js Bitcoin coin (`scripts/coin-gl.ts`: gold metal, canvas-engraved inscription and circuit traces, extruded ₿, reeded edge) loads on the visitor's first move or after 6 s, sways gently facing the viewer, tilts with the pointer and turns once as you scroll out of the hero. Skipped with reduced motion, slow data or no WebGL2.
- Desktop only (fine pointer): Lenis smooth scroll and the pinned four-step payment section. Below 900px, or without JS, the four steps show as a plain stacked list.
