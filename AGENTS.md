# NuxtBooks agent guidance

Catalog and book pages are dynamic; they do not use ISR. Cache database results in the Nitro API routes with `defineCachedEventHandler`. On Vercel, `nitro.storage.cache` uses `vercel-runtime-cache`; local and test builds use Nitro's in-memory fallback. Keep cache keys stable and based on normalized inputs. Only bump the `nuxt-books:v1` namespace when intentionally invalidating every entry.

Nuxt needs the header-only page `routeRules` cache marker to expose runtime `_payload.json` routes without caching rendered pages in Nitro. Keep `/api/**` excluded from that rule because API handlers own their cache policy. When changing page data fetching, links, pagination, caching, or `routeRules`, preserve `_payload.json` prefetching and adjacent `/api/books` cache warming, then run `pnpm test:e2e` against the production build.

Local tests cannot verify the Vercel storage driver. After changing the storage mount, namespace, or handler cache policy, use a Vercel preview and Runtime Cache Observability before considering provider behavior verified.

Keep database access in `server/lib/db/`. Vue components must receive database data through Nitro API routes so credentials and database drivers stay out of the client bundle.
