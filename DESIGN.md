# Design

World: a security-printed banknote. Each course is a note; the price is the denomination, TRC20 is the series. Tokens live in `apps/site/src/styles/global.css`.

## Color (Full palette, light ground)

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | #E9EDE2 | Page ground (security paper) |
| `--paper-deep` | #DDE5D8 | Alternate band, panels |
| `--ink` | #12261D | Body text |
| `--green` | #1F4D3A | Intaglio ink: headings, rules, primary button, reverse-side regions |
| `--green-deep` | #173B2C | Footer, hover |
| `--teal` | #5FA39B | Guilloche linework only (never text) |
| `--red` | #B3261E | Numbering-machine red: series lines, Buy buttons, savings, focus ring |
| `--muted` | #3F5A4D | Secondary text (6.9:1 on paper) |
| `--uv-ground` / `--uv-ink` | #241640 / #E8FF5A | UV-lamp layer only |

Green owns whole regions (FAQ, savings table, footer), never just accents.

## Type

- Display: Bodoni Moda (variable, `opsz` axis set to 96 for large sizes). Headings and all price numerals.
- Body: Atkinson Hyperlegible 400/700, chosen for non-native English readers.
- Serial lines: body face, bold, uppercase, red, tracked 0.08em. Only on series lines, nowhere else.
- No eyebrow labels above headings. No gradient text.

## Layout and components

- One unit: `--u: 8px`. Frames, gaps and section padding are multiples of it.
- Frames: `.frame` double rule (2px border + 1px inset outline). Used for the note, specimens, the player and the payment stage.
- Catalog is a ledger (rows divided by rules), not cards. Each row: specimen, description, denomination, Buy.
- Buttons: 4px radius. Primary = green fill; Secondary = green outline; Buy = red fill (links to `checkoutUrl` only).
- Delivery uses two stubs split by a dotted perforation.

## Motion

- One authored moment: the three.js guilloche rosette draws in once (1.8 s, expo-out); afterwards it only moves when the pointer moves over the note.
- User-driven: UV lamp (clip-path circle that follows the pointer on desktop and covers the note on touch), pinned payment steps on desktop scroll, accordion open.
- Reduced motion or slow data: no WebGL, no Lenis, no pin; the rosette is drawn once on a 2D canvas.
