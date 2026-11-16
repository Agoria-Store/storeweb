import { createStoreClient, type StoreClient } from '@course-store/store-client';

let client: Promise<StoreClient> | undefined;

/** Build-time only. Never import from a client-side <script>. */
export function store(): Promise<StoreClient> {
  client ??= createStoreClient({ STORE_PROVIDER: process.env.STORE_PROVIDER });
  return client;
}

export const TELEGRAM_BOT_URL = import.meta.env.PUBLIC_TELEGRAM_BOT_URL || '#';
export const BRAND = 'Agoria Store';
