const STORAGE_PREFIX = "luperini-product-viewers";
const SESSION_PREFIX = "luperini-product-session-viewing";
const MIN_VIEWERS = 1;
const MAX_VIEWERS = 5;
const STALE_MS = 30 * 60 * 1000;
const UPDATE_MIN_MS = 20_000;
const UPDATE_MAX_MS = 45_000;

export type ProductViewerState = {
  count: number;
  nextUpdateAt: number;
  updatedAt: number;
};

export function productViewerStorageKey(slug: string) {
  return `${STORAGE_PREFIX}:${slug}`;
}

function sessionStorageKey(slug: string) {
  return `${SESSION_PREFIX}:${slug}`;
}

function hashSlug(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function clampViewerCount(count: number) {
  return Math.min(MAX_VIEWERS, Math.max(MIN_VIEWERS, Math.round(count)));
}

function seedViewerCount(slug: string) {
  return (hashSlug(slug) % MAX_VIEWERS) + MIN_VIEWERS;
}

export function getProductViewerSeedCount(slug: string) {
  return seedViewerCount(slug);
}

function randomUpdateDelayMs(slug: string, salt: number) {
  const bucket = Math.floor(Date.now() / 60_000);
  const hash = hashSlug(`${slug}:${salt}:${bucket}`);
  return UPDATE_MIN_MS + (hash % (UPDATE_MAX_MS - UPDATE_MIN_MS + 1));
}

function createViewerState(slug: string, count: number): ProductViewerState {
  const now = Date.now();
  return {
    count: clampViewerCount(count),
    nextUpdateAt: now + randomUpdateDelayMs(slug, count),
    updatedAt: now,
  };
}

function applySessionBump(slug: string, count: number) {
  if (typeof window === "undefined") {
    return count;
  }

  try {
    const key = sessionStorageKey(slug);
    if (sessionStorage.getItem(key)) {
      return count;
    }

    sessionStorage.setItem(key, String(Date.now()));
    const shouldBump = hashSlug(`${slug}:session`) % 100 < 60;
    return shouldBump ? clampViewerCount(count + 1) : count;
  } catch {
    return count;
  }
}

function nextViewerCount(current: number, slug: string, tick: number) {
  const roll = hashSlug(`${slug}:tick:${tick}`) % 100;

  if (roll < 40) return current;
  if (roll < 55) return clampViewerCount(current + 1);
  if (roll < 70) return clampViewerCount(current - 1);
  if (roll < 85) {
    return clampViewerCount(current + (roll % 2 === 0 ? 2 : -2));
  }

  return current;
}

export function readProductViewerState(slug: string): ProductViewerState {
  const now = Date.now();

  if (typeof window === "undefined") {
    return createViewerState(slug, seedViewerCount(slug));
  }

  try {
    const raw = localStorage.getItem(productViewerStorageKey(slug));
    if (raw) {
      const parsed = JSON.parse(raw) as ProductViewerState;
      if (
        typeof parsed.count === "number" &&
        typeof parsed.nextUpdateAt === "number" &&
        typeof parsed.updatedAt === "number" &&
        now - parsed.updatedAt <= STALE_MS
      ) {
        return {
          ...parsed,
          count: clampViewerCount(parsed.count),
        };
      }
    }
  } catch {
    // ignore corrupted storage
  }

  const seeded = applySessionBump(slug, seedViewerCount(slug));
  return createViewerState(slug, seeded);
}

export function writeProductViewerState(slug: string, state: ProductViewerState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(productViewerStorageKey(slug), JSON.stringify(state));
  } catch {
    // ignore quota / privacy mode
  }
}

export function advanceProductViewerState(
  slug: string,
  state: ProductViewerState,
): ProductViewerState {
  const now = Date.now();
  if (now < state.nextUpdateAt) {
    return state;
  }

  const tick = Math.floor(now / 1000);
  const next = createViewerState(slug, nextViewerCount(state.count, slug, tick));
  writeProductViewerState(slug, next);
  return next;
}
