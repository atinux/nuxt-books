# Vercel Runtime Cache exploration

NuxtBooks can move its database-backed API cache from Vercel ISR to Nitro v2's
cache layer by mounting Vercel Runtime Cache at `nitro.storage.cache`. Keep the
Vercel driver conditional so local production builds use Nitro's default
in-memory storage, and put the one-hour policy on the cached handlers or cached
functions. Commenting the current ISR `routeRules` makes the Nuxt pages
dynamic; the Runtime Cache then protects the API data rather than caching the
rendered page. This repository must retain a minimal header-only `cache` rule,
however, because Nuxt only enables runtime payload extraction when at least one
route has a `cache` or `isr` rule. The rule preserves `_payload.json`
navigation without storing rendered pages in Nitro's cache
([Nuxt runtime payload extraction behavior](https://github.com/nuxt/nuxt/issues/34961)).

This note is based on the versions currently resolved in `pnpm-lock.yaml`:
Nitro `2.13.4` and unstorage `1.17.5`.

## Recommended storage configuration

Nitro v2 stores cached handlers and functions under the `cache` storage mount.
Production uses memory by default, so a serverless deployment needs a shared
backend for cross-invocation hits. Nitro's documented Nuxt configuration shape
is `nitro.storage.cache`, and its development cache can be configured
separately with `nitro.devStorage.cache` ([Nitro v2 cache storage](https://v2.nitro.build/guide/cache#customize-cache-storage)).

Use the unstorage Vercel Runtime Cache driver only in Vercel builds:

```ts
export default defineNuxtConfig({
  nitro: {
    future: {
      nativeSWR: true,
    },
    storage: process.env.VERCEL
      ? {
          cache: {
            driver: 'vercel-runtime-cache',
            base: 'nuxt-books:v1',
          },
        }
      : {},
  },
});
```

`future.nativeSWR` keeps Nitro's cache rules in the Nitro runtime on Vercel
instead of converting legacy SWR configuration into provider ISR routes. Nitro
v2's Vercel preset explicitly recommends this flag when opting out of its
backward-compatible ISR conversion
([Nitro v2 Vercel preset source](https://github.com/nitrojs/nitro/blob/v2/src/presets/vercel/utils.ts)).

The `VERCEL` system variable is available at build and runtime with the value
`1` when Vercel system variables are exposed
([Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables#vercel)).
The guard matters for this repository because `pnpm test:e2e` builds and starts
the production Nitro server locally, where the Vercel request context does not
exist. Without the guard, unstorage throws `Runtime cache is not available!`
when it cannot find either the platform context or `@vercel/functions`
([unstorage `v1.17.5` Vercel driver source](https://github.com/unjs/unstorage/blob/v1.17.5/src/drivers/vercel-runtime-cache.ts)).

Keep a namespaced and versioned `base`. The unstorage driver prefixes every key
with `base`, and Vercel shares one Runtime Cache among all projects in a Hobby
team. Pro and Enterprise isolate it per project
([unstorage driver options](https://github.com/unjs/unstorage/blob/v1.17.5/src/drivers/vercel-runtime-cache.ts),
[Vercel storage scope](https://vercel.com/docs/caching/runtime-cache#storage-scope-by-plan)).
Changing the version is also a predictable way to abandon entries after a
cache-policy change. Vercel warns that TTL and tag changes are not reconciled
between deployments and recommends purging the cache or changing the key
([Vercel Runtime Cache limits](https://vercel.com/docs/caching/runtime-cache#limits-and-usage)).

Do not put `ttl: 3600` on the storage driver when the Nitro cache uses
`swr: true`. Nitro v2 stores freshness metadata in the entry and only forwards
a storage TTL when SWR is disabled. A driver-level one-hour TTL would remove
the stale value at the revalidation boundary, so the next request would block
instead of receiving stale data during refresh
([Nitro v2 cache implementation](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts#L78-L156)).

## Option A: Cache each API response

`defineCachedEventHandler` is the smallest change to the three book API routes:

```ts
export default defineCachedEventHandler(
  async event => {
    // Read normalized request inputs and query the catalog.
  },
  {
    maxAge: 60 * 60,
    name: 'books-page',
    swr: true,
  },
);
```

Nitro v2 documents that `maxAge: 3600` caches the response for one hour, and
that cached event handlers use stale-while-revalidate by default
([Nitro v2 cached event handlers](https://v2.nitro.build/guide/cache#cached-event-handlers),
[Nitro v2 cache options](https://v2.nitro.build/guide/cache#options)). Use a
different explicit `name` for the page, count, and detail handlers.

This approach needs an explicit key strategy for the catalog handlers. In
Nitro `2.13.4`, the default cached-handler key hashes the full original request
URL, including its query string. The existing ISR rules instead allowlist seven
parameters for `/api/books` and six for `/api/books/count`. Without a custom
key, reordered parameters, unknown parameters, and equivalent inputs that
`parseSearchParams` normalizes can create separate Runtime Cache entries
([Nitro v2 generated handler key](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts#L233-L254)).

Derive `getKey` from the normalized `BookQuery` or `BookFilters`, and hash the
stable serialized value to hexadecimal. Nitro v2 strips non-word characters
from a custom key, so returning raw JSON or a delimiter-heavy string can create
collisions
([Nitro v2 custom-key normalization](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts#L191-L193),
[Nitro v2 key documentation](https://v2.nitro.build/guide/cache#normalizing-cache-keys)).
For the detail route, derive the key from the normalized book ID. A hexadecimal
SHA-256 result is safe from Nitro's key stripping and keeps long searches from
creating long storage keys.

Cached handlers also remove request headers unless they appear in `varies`.
The current routes depend only on path and query inputs, so no `varies` entry is
needed. Nitro does not cache handler responses with status codes of 400 or
higher, which means the detail route's `404` remains uncached
([Nitro v2 cached-handler behavior](https://v2.nitro.build/guide/cache#cached-event-handlers),
[Nitro v2 response validation](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts#L256-L273)).

### CDN caching caveat

This option is not Runtime-Cache-only. With `swr: true` and
`maxAge: 3600`, Nitro v2 adds `Cache-Control: s-maxage=3600,
stale-while-revalidate` to the API response
([Nitro v2 response-header implementation](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts#L394-L408)).
Vercel uses `s-maxage` to cache complete responses in its CDN, while Runtime
Cache is intended for database queries, API calls, and computed values inside
functions
([Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache),
[Vercel Runtime Cache use cases](https://vercel.com/docs/caching/runtime-cache#when-to-use-runtime-cache)).
The result can therefore be two layers:

1. Vercel CDN caches the complete API response and can avoid invoking Nitro.
2. On a CDN miss, Nitro checks its cached response entry in regional Runtime
   Cache before querying PostgreSQL.

That is still different from ISR, but it makes a comparison of ISR versus
Runtime Cache less isolated.

## Option B: Cache catalog data inside plain handlers

If the experiment is meant to exercise only Runtime Cache, prefer
`defineCachedFunction` for `getBooksPage`, `getBooksCount`, and `getBookById`,
then call those functions from ordinary `defineEventHandler` routes. Nitro v2
stores cached-function results in the same `cache` mount without synthesizing
HTTP cache headers
([Nitro v2 cached functions](https://v2.nitro.build/guide/cache#cached-functions),
[Nitro v2 cache implementation](https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/cache.ts)).
This matches Vercel's model more closely: Runtime Cache stores reusable data
inside a function, while CDN cache stores complete HTTP responses
([Vercel caching-layer guidance](https://vercel.com/docs/caching/runtime-cache#working-with-cdn-cache)).

Pass the event as the first cached-function argument and exclude it from the
custom key. Nitro recommends this pattern on worker-style runtimes so
background refreshes can use `event.waitUntil`
([Nitro v2 edge-worker cache guidance](https://v2.nitro.build/guide/cache#edge-workers)).
The same normalized, hashed query keys described above still apply.

## Behavior and limits to account for

- Runtime Cache is regional. Each function region has its own cache, so a hit
  in one region does not warm another. Preview and production never share
  entries, and entries can persist across deployments
  ([Vercel Runtime Cache behavior](https://vercel.com/docs/caching/runtime-cache#how-runtime-cache-works)).
- Runtime Cache is non-durable and evicts least-recently-used entries when it
  reaches its storage limit. It cannot guarantee retention for the full TTL
  ([Vercel storage and eviction](https://vercel.com/docs/caching/runtime-cache#storage-and-eviction)).
- Each item is limited to 2 MB. The API page size must remain comfortably below
  that after Nitro wraps the body, status, headers, timestamp, and integrity in
  its cache entry
  ([Vercel Runtime Cache limits](https://vercel.com/docs/caching/runtime-cache#limits-and-usage)).
- Runtime Cache usage is charged, and Vercel exposes reads, writes, hit rate,
  revalidations, tags, and storage activity in Runtime Cache Observability
  ([Vercel Runtime Cache observability](https://vercel.com/docs/caching/runtime-cache#observability)).

## Verification for this branch

Run `pnpm test:e2e` against the local production build, as required by
`AGENTS.md`. The conditional storage configuration means this suite verifies
the same Nitro caching logic with local memory storage, not the Vercel backend.

The existing pagination test also needs a new assertion after ISR is disabled.
It currently requires an ISR-derived cache-control value on
`/_payload.json?page=2`. Preserve the `_payload.json` request and browser
prefetch behavior with a header-only cache rule, but expect that rule's cache
header instead of the old ISR header.

Finally, use a Vercel preview deployment to verify the platform backend:

1. Request representative list, count, and detail keys twice.
2. Confirm Runtime Cache reads, writes, and hits in Vercel Observability.
3. Repeat from every configured function region to account for regional
   caches.
4. If using `defineCachedEventHandler`, separately inspect CDN behavior so a
   CDN hit is not mistaken for a Runtime Cache hit. Vercel notes that
   `x-vercel-cache` can report `MISS` even when a function used Runtime Cache
   ([Vercel cache-status header](https://vercel.com/docs/headers/response-headers#x-vercel-cache)).
