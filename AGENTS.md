# NuxtBooks agent guidance

Catalog and book pages depend on Nitro ISR plus extracted Nuxt payloads. When changing page data fetching, links, pagination, or `routeRules`, preserve the `_payload.json` prefetch behavior and run `pnpm test:e2e` against the production build.

Keep database access in `server/lib/db/`. Vue components must receive database data through Nitro API routes so credentials and database drivers stay out of the client bundle.
