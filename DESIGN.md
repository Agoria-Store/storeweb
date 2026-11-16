# Design

A calm, light storefront built around one hero object: a glossy 3D USDT coin. Craft bar: Apple product pages, Stripe, Gumroad / Lemon Squeezy. Tokens live in `apps/site/src/styles/global.css`.

## Color

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | #FBFBFD | Page background, nav |
| `--surface` | #FFFFFF | Cards |
| `--surface-2` | #F0F2F7 | Inset panels, filter track |
| `--ink` | #121826 | Text, dark CTA card |
| `--muted` | #4A5468 | Secondary text |
| `--line` | #E3E6EE | Dividers |
| `--primary` | #5B3DF5 | Primary buttons, active states, focus ring |
| `--primary-soft` | #EEEAFF | Tints behind primary numbers/icons |
| `--money` | #08734F | USDT prices |
| `--tether` | #26A17B | The coin, the USDT dot |
| `--sun` | #FFD23F | "Save X%" badges only |
| `--tg` / `--tg-soft` | #1D8FD1 / #E3F3FC | Telegram delivery only |

## Type

Geist Variable throughout. Hero h1 weight 600, tracking -0.045em, line-height 1. h2 650 / -0.035em. h3 line-height 1.15.

## Illustrations

`Illustration.astro` draws every product thumbnail as SVG geometry (no picture-style drawings):
- Courses cycle through scenes: `candles` (candlestick chart + trend), `network` (coin with orbiting nodes), `wave` (layered curves).
- Bundles: `layers` (stacked isometric slabs).
- Chapters/videos: quiet grey tile with a large number and a small motif from the parent course's scene.
A real `thumbnailUrl` always replaces the illustration.

## Components

- Cards: white, 16px radius, one soft shadow; hover lifts 4px. Footer row shows delivery and "View course" in primary.
- Buttons: pill. Primary violet, Secondary white with border, `.small` for inline actions.
- Prices `.price` in green with "USDT"; savings in a yellow `.badge-save`, always computed from catalog data.

## Motion

- Hero: SVG coin renders immediately. The three.js coin (`scripts/coin-gl.ts`) loads on the visitor's first move or after 6 s, spins slowly, tilts with the pointer and turns with scroll. Skipped with reduced motion, slow data or no WebGL2.
- Desktop only (fine pointer): Lenis smooth scroll and the pinned four-step payment section. Below 900px, or without JS, the four steps show as a plain stacked list.
