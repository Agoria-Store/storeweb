# Course Store — rules for Claude Code

Full context: `docs/PROJECT_BRIEF.md`. Read it before any task.

## What we're building
A store selling digital products (video courses first: full course, per chapter, per video; later e-books, templates, bundles) to international buyers, paid in USDT on TRC20.
- A rented store platform (not yet chosen) handles checkout, payment detection, file delivery and orders.
- We build only: (1) a landing website, (2) a Telegram bot, (3) a `storeClient` adapter they share.

## Hard rules
- NEVER write payment-processing, wallet or blockchain code. Buy buttons link to the platform's hosted `checkoutUrl`.
- NEVER put wallet seed phrases, private keys, API keys or bot tokens in code or git. Use `.env` (gitignored) and keep `.env.example` with names only.
- Only `packages/store-client` talks to the store platform. The site and bot import from it, never call a platform API directly.
- Platform API keys stay server-side (site build time, bot worker). Never ship a key to the browser.
- Until the platform is chosen, `storeClient` uses `MockStore` reading `data/products.json`. Add new platforms as new implementations of the same interface.
- One general product model with a `type` field (see the brief). Don't hard-code "course" logic where `type` works.
- Verify the signature of every incoming webhook, and de-duplicate by order ID.
- TypeScript everywhere (shared adapter). Bot: grammY. Site: Astro.
- Respect `prefers-reduced-motion`. Mobile-first. Landing page performance budget: LCP < 2.5 s on mid-range mobile, Lighthouse performance ≥ 85.
- Small, reviewable steps. Show a plan before large changes. Ask before adding paid services or anything irreversible.

## Layout
```
apps/site/              Astro landing site
apps/bot/               grammY Telegram bot (Cloudflare Workers, webhook mode)
packages/store-client/  interface + MockStore (+ platform adapters later)
data/products.json      mock catalog until the platform is live
docs/                   PROJECT_BRIEF.md, decisions
```
