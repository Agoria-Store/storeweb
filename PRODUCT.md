# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

International buyers of crypto and trading video courses who already hold USDT, or are willing to get it. They arrive on mobile from Telegram, social posts or search, and decide whether to buy a full course, one chapter, or one video. Many are price-sensitive and wary of scams in this niche.

## Product Purpose

A storefront for crypto/trading video courses owned or resold by two partners. The site shows the catalog, lets visitors preview content for free, explains how USDT (TRC20) payment works, and sends buyers to the store platform's hosted checkout. Success means a visitor understands what they get, trusts the payment flow, and starts a checkout (ideally for the full course).

## Positioning

Pay in USDT on TRC20 only, and buy granularly: full course, single chapter, or single video. Chapter prices add up to about 1.5–2× the full course price, so the full course is the clear deal. Delivery is either an expiring download link or a one-time invite to a private Telegram channel.

## Operating Context

- A rented store platform (not yet chosen) owns checkout, payment detection, delivery and orders. The site never handles payments or wallets.
- A Telegram bot offers the same catalog and handles channel invites.
- Catalog data comes from `storeClient` at build time; `data/products.json` mocks it until a platform is chosen.

## Capabilities and Constraints

- Astro static site on Cloudflare Pages. TypeScript. Small JS islands.
- Performance budget: LCP < 2.5 s on mid-range mobile, Lighthouse performance ≥ 85.
- Respect `prefers-reduced-motion`; mobile-first; keyboard navigable; 4.5:1 body contrast.
- Undecided: brand name, logo, store platform, domain, real course list and prices.

## Brand Commitments

- No brand name or logo yet.
- Standing preference (2026-11-16): a general, modern, light design at the craft level of Stripe and Gumroad / Lemon Squeezy, not a themed concept world. Subtle three.js hero allowed. Themed worlds (exchange board, banknote) were tried and rejected.

## Evidence on Hand

No real course titles, prices, media, testimonials, student counts, earnings claims or press. Never fabricate any of these; use bracketed placeholders. Trading courses must not imply guaranteed profits.

## Product Principles

1. Trust before persuasion: make the payment and delivery process obvious and checkable.
2. The full course is the clear best deal, shown with numbers calculated from the data, never invented.
3. Respect the buyer's attention and data: fast on phones, no dark patterns, no fake urgency.
4. One product model: design for courses now, but don't block e-books, templates or bundles later.

## Accessibility & Inclusion

WCAG AA contrast, visible focus, full keyboard use, reduced motion respected, readable for non-native English speakers (plain language).
