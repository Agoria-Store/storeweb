# Design

A light, modern storefront at the craft level of Stripe and Gumroad / Lemon Squeezy. Tokens live in `apps/site/src/styles/global.css`.

## Color

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | #F7F8FB | Page background |
| `--surface` | #FFFFFF | Cards, nav after scroll |
| `--surface-2` | #F0F2F7 | Inset panels, filter track |
| `--ink` | #121826 | Text, dark buttons, footer CTA |
| `--muted` | #4A5468 | Secondary text (7.6:1 on bg) |
| `--line` | #E3E6EE | Dividers, outlines |
| `--primary` | #5B3DF5 | Primary buttons, active states, focus ring |
| `--primary-soft` | #EEEAFF | Tints behind primary icons/numbers |
| `--money` | #08734F | USDT prices (5.3:1 or better on every surface) |
| `--sun` | #FFD23F | "Save X%" badges only |

Hero gradient colours (three.js shader and CSS fallback): #5B3DF5, #FF7AC6, #FFD23F, #5EEAD4.

## Type

Geist Variable for everything. Headings weight 650, tracking -0.035em, `text-wrap: balance`. Body 17px / 1.6.

## Components

- Cards: white, 16px radius, one soft shadow (`--shadow`); hover lifts 4px to `--shadow-lg`.
- Buttons: pill. Primary = violet fill; Secondary = white with border; Dark = ink fill.
- Prices always `.price` (green, tabular numerals) with "USDT" after the number.
- Savings always a yellow `.badge-save` pill, computed from catalog data.

## Motion

- Hero: three.js flowing gradient band (skewed), loaded 1.5 s after page load, rendered at half resolution, paused offscreen. CSS gradient fallback for reduced motion, slow data or no WebGL.
- Hero checkout card rises in once (transform only, so it never delays LCP).
- Pinned four-step payment section on desktop (GSAP ScrollTrigger); Lenis smooth scroll. Both off under reduced motion.
