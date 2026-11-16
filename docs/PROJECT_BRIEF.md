# Project brief — Course Store

Decisions made in planning, 16 Nov 2026. Treat as the source of truth; flag anything that conflicts.

## 1. Business
- Two partners selling video courses we own or hold resale rights to (my courses + partner's). Later: e-books, templates, bundles and other digital products.
- Phase 1 market: international buyers only. Phase 2: Cambodian buyers via KHQR.
- Payment: USDT only, TRC20 network first. Possibly cards later via the same platform.
- Pricing options: full course, single chapter, single video. Chapters priced so all chapters add up to about 1.5–2× the full course (pushes buyers to the full course).
- Delivery options per product: expiring download link (files), OR one-time invite to a private Telegram channel.
- Roles: me = operations (platform, site, bot, wallet, payouts); partner = content and marketing.
- Revenue split per product by `owner`, settled weekly in USDT, tracked in a sheet.

## 2. Architecture: headless commerce
- A rented SaaS store platform is the backend and system of record: catalog, hosted checkout, on-chain payment detection, file delivery, orders, webhooks.
- Our code = thin, stateless front ends: static website + Telegram bot, both reading the catalog through `storeClient`.
- No own server, no database, no custody of buyer funds. Not a monolith, not microservices.

### Components
| Component | Responsibility | Tech | Hosting |
| --- | --- | --- | --- |
| Store platform | Catalog, checkout, payment detection, delivery, orders | Rented (TBD) | Vendor |
| Website | Catalog, previews, free chapter, FAQ, Buy → checkoutUrl | Astro + TypeScript | Cloudflare Pages |
| Telegram bot | Catalog menu, Buy → checkoutUrl, order claim → one-time channel invite | grammY, webhook mode | Cloudflare Workers |
| storeClient | Only code talking to the platform; returns our Product model | TypeScript package | Repo |
| Wallet | Receives USDT TRC20 | Self-custody | Not in code |

### Design patterns
- Single source of truth: products and orders live on the platform only.
- Adapter (ports and adapters): `StoreClient` interface; `MockStore` now, real platform adapter later; own checkout ("option B") later = new implementation, site and bot unchanged.
- General product model with `type` field; Composite: course → chapters → videos; bundles contain products.
- Cache-aside with TTL (few minutes) in the bot.
- Event-driven webhooks: "order paid" → admin alert in Telegram + unlock channel access.
- Idempotency: de-duplicate webhooks by order ID.
- Configuration as environment: secrets in env vars only.

### Product model
```ts
type ProductType = 'course' | 'chapter' | 'video' | 'ebook' | 'template' | 'bundle';
type Delivery = 'download' | 'telegram_channel';

interface Product {
  id: string;
  type: ProductType;
  title: string;
  slug: string;
  description: string;
  parentId?: string;        // chapter/video → its course
  includes?: string[];      // bundle → product ids
  owner: 'me' | 'partner';
  priceUsdt: number;
  checkoutUrl: string;      // platform hosted checkout
  previewUrl?: string;      // free clip/chapter
  thumbnailUrl?: string;
  delivery: Delivery;
  telegramChannelId?: string; // when delivery = telegram_channel
  active: boolean;
  sortOrder: number;
}

interface StoreClient {
  listProducts(filter?: { type?: ProductType; parentId?: string }): Promise<Product[]>;
  getProduct(idOrSlug: string): Promise<Product | null>;
  getOrder(orderId: string): Promise<{ id: string; productId: string; status: 'pending'|'paid'|'delivered'|'failed' } | null>;
}
```

### Flows
**Purchase:** buyer opens product (site or bot) → Buy opens `checkoutUrl` → platform shows USDT amount + TRC20 address → platform detects and confirms payment → delivers download link → USDT to our wallet → sale in order records.

**Channel delivery:** after paying, buyer sends their order ID to the bot (or a deep link carries it) → bot calls `storeClient.getOrder` → if paid and not yet claimed, bot creates a Telegram invite link with `member_limit: 1` and an expiry, and sends it → record the claim (idempotent). Channels have "Restrict saving content" on.

**Payment states (platform side):** pending → detected → confirmed → delivered; exceptions (underpaid, overpaid, expired, wrong network) handled manually.

**Catalog updates:** product changed in the platform dashboard → bot refreshes on cache expiry; site rebuilds on webhook or schedule. Until then: edit `data/products.json` → commit → auto-deploy.

## 3. Security musts
- No seed phrase/private key anywhere. Read-only platform API key, server-side only.
- Webhook signatures verified. Download links expire and are limited. Channel invites single-use.
- 2FA on all accounts. Bot never accepts payment details in chat.

## 4. Landing page — creative brief
Goal: a landing page that feels premium and alive, but still converts and loads fast on phones.

**Must-have sections**
1. Hero: bold headline, short value line, primary CTA "Browse courses", secondary "Get a free chapter". Background: looping muted video (WebM + MP4, poster image, lazy) OR an animated WebGL/canvas scene; fall back to the poster when `prefers-reduced-motion` or slow connection.
2. Course catalog: cards with thumbnail, title, price in USDT; hover/tap plays a muted preview clip; filter by type (course, chapter, bundle) and owner-agnostic.
3. Course detail (page or modal): chapter accordion with per-chapter prices, "full course saves X%" computed from data, Buy buttons → `checkoutUrl`.
4. Free chapter: embedded preview player.
5. "How to pay with USDT" interactive stepper (choose network TRC20 → copy amount → send → get access), animated on scroll.
6. Delivery explainer: download link vs private Telegram channel.
7. FAQ (refunds, wrong network, how long confirmation takes, how files are delivered).
8. Footer with Telegram bot link.

**Motion and interaction**
- GSAP + ScrollTrigger for scroll-driven reveals, pinned "how it works" sequence, number counters; Lenis for smooth scrolling (disable on reduced motion).
- Micro-interactions: magnetic CTA buttons, card tilt on hover (desktop only), animated price/savings badge.
- Keep JS islands small; animations transform/opacity only; no layout thrash.
- Copy placeholders like [COURSE TITLE], [PRICE] — never invent stats, testimonials or student counts.

**Look**
Dark, modern fintech/education feel: near-black navy ground, teal accent (#2DD4BF / #0F766E), amber for money highlights (#F59E0B). Headings Space Grotesk, body Inter. Accessible contrast (4.5:1 body text), real buttons/links, keyboard navigable.

## 5. Build order
1. Monorepo scaffold (pnpm workspaces), TypeScript, lint/format, `.env.example`, CLAUDE.md, this brief in `docs/`.
2. `packages/store-client`: interface, `MockStore`, `data/products.json` with 2 sample courses × 3 chapters (placeholder text), unit tests.
3. `apps/site`: landing page per §4, reading from `storeClient` at build time.
4. `apps/bot`: catalog menu, Buy buttons, order-claim → one-time channel invite (against MockStore), webhook handler with signature check stub.
5. Deploy configs: Cloudflare Pages (site), Cloudflare Workers (bot), GitHub auto-deploy.
6. Later: real platform adapter once chosen.

## 6. Open decisions (don't decide silently)
- Store platform: must support USDT TRC20, auto delivery, product API; prefer non-custodial payouts, Telegram channel delivery, large file limits. Candidates: Fungies, Sell.app, Shoppex, Sellix.
- Real course list, prices, and media (videos, thumbnails, logo, brand name).
- Domain name (start on the free `*.pages.dev`).
