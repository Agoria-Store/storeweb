# Agoria Store (storeweb)

Landing site, Telegram bot and shared store adapter for a crypto/trading video course store paid in USDT (TRC20).

- `apps/site` – Astro landing site
- `apps/bot` – grammY Telegram bot (not built yet)
- `packages/store-client` – `StoreClient` interface + `MockStore`
- `data/products.json` – mock catalog until the store platform is chosen

See `docs/PROJECT_BRIEF.md`, `PRODUCT.md` and `DESIGN.md`.

## Develop

pnpm runs through corepack (no global install needed):

```bash
corepack pnpm install
corepack pnpm --filter site dev
corepack pnpm -r test
```

Copy `.env.example` to `.env` for local settings. Never commit real keys or tokens.
