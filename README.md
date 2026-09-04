<div align="center">

<img src="public/logo.svg" alt="NuxtBooks" width="72" height="72" />

# NuxtBooks

NuxtBooks serves a curated catalog of 100,000 Goodreads books that fits within the free Neon database tier. The catalog uses Nuxt 4, Vue, Nitro, Drizzle, and PostgreSQL.

[**View the source on GitHub →**](https://github.com/atinux/nuxt-books)

</div>

---

NuxtBooks rebuilds [NextBooks](https://github.com/vercel-labs/next-books) with [Nuxt](https://github.com/nuxt/nuxt). You can download the complete source dataset from the [UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).

## How it works

NuxtBooks renders pages dynamically, caches reusable database responses on the server, and prefetches the route data and images most likely to be needed next.

### Server caching

Catalog and book pages don't use incremental static regeneration (ISR). A header-only page `routeRules` cache marker lets Nuxt expose browser-cacheable `_payload.json` responses for client navigation without storing the rendered pages in Nitro. The `/api/**` routes are excluded because their handlers define their own cache policy. See [Nuxt payload extraction](https://nuxt.com/docs/4.x/getting-started/prerendering#payload-extraction) for details.

The `/api/books`, `/api/books/count`, and `/api/books/:id` routes use [`defineCachedEventHandler`](https://nitro.build/docs/cache#cached-handlers). Cached responses remain fresh for one hour. After that, Nitro can serve the stale value while it refreshes the entry in the background. Stable hashed keys derived from normalized filters, pagination, or book IDs ensure that equivalent requests share an entry.

On Vercel, Nitro stores these entries in [Vercel Runtime Cache](https://vercel.com/docs/caching/runtime-cache) under the versioned `nuxt-books:v1` namespace. Local development and tests use the same handlers with an in-memory cache. Change the namespace version only when every existing entry must be invalidated.

### Navigation and image prefetching

NuxtBooks controls when it fetches route payloads and priority cover images so likely navigations start early without prefetching every book at once.

<!-- prettier-ignore -->
> [!NOTE]
> `prefetchPreloadTags` is experimental and may change in a future Nuxt release.

- **Fast links:** [`<FastLink>`](app/components/FastLink.vue) wraps `<NuxtLink>` and starts an unmodified primary-button navigation on `mousedown`. Modified clicks, keyboard navigation, interactive descendants, and Nuxt's built-in prefetch behavior remain unchanged.
- **Preserved page state:** [`<NuxtPage keepalive>`](app/app.vue) uses [Nuxt's keep-alive support](https://nuxt.com/docs/4.x/directory-structure/app/pages#keepalive) to retain the catalog and book page instances across route changes. Returning from a book restores the loaded catalog results and local page state without remounting the catalog page.
- **Book routes:** links on the first catalog page use [visibility-based prefetching](https://nuxt.com/docs/4.x/api/components/nuxt-link#prefetch-links). Links on later pages wait for hover or keyboard focus, which limits unnecessary requests while preserving intent-based prefetching.
- **Priority images:** the first ten covers on each catalog page and the cover on each book page use `<NuxtImg preload>`. [`experimental.prefetchPreloadTags`](https://nuxt.com/docs/4.x/guide/going-further/experimental-features#prefetchpreloadtags) forwards a destination cover hint during route prefetch. The [image preload adapter](app/plugins/prefetch-image-preloads.client.ts) changes matching Vercel and IPX hints from generic prefetches to low-priority image preloads before Unhead inserts them. The browser then sends its image-specific `Accept` header and can reuse the response on navigation.
- **Pagination:** when the controls enter the viewport, NuxtBooks requests the adjacent `/api/books` variants to warm their server cache entries. The pagination links also prefetch their `_payload.json` responses for client navigation.

## Run locally

You need Node.js 22 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

`DATABASE_URL` is optional. Without it, NuxtBooks serves a generated preview catalog. `POSTGRES_URL` remains supported for existing environments.

Verify a change with these commands:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Testing

Run the Playwright suite against a production Nitro build:

```bash
pnpm test:e2e
```

The suite covers extracted-payload navigation, prefetching, `FastLink` behavior, search cancellation, kept-alive catalog restoration, image-preload reuse, pagination warming, and scroll restoration. Cached handlers use the in-memory storage driver during this local run.

Only a Vercel deployment uses the Runtime Cache driver. After changing cache storage, keys, or handler policy, deploy a preview and inspect reads, writes, and hit rates in Vercel Runtime Cache Observability.

## Database

The original dataset contains more than two million Goodreads books, while the hosted catalog contains a curated 100,000-book subset. The schema uses PostgreSQL's `unaccent` extension for accent-insensitive title search.

### Load the sample data

Connect a Neon database through the Vercel Marketplace, or set `DATABASE_URL` to another PostgreSQL connection string. `POSTGRES_URL` remains supported for existing environments. Create the schema and load the bundled four-book sample:

```bash
pnpm db:setup
```

Optionally generate cover-image placeholders for the four bundled sample books:

```bash
pnpm db:seed-thumbhash
```

### Import the complete dataset

To import the complete UCSD Goodreads catalog, create the schema without loading the sample, then download the compressed book and author metadata files into the ignored `data/` directory. The seeders read gzip files directly, preserve Goodreads IDs, and checkpoint large imports:

```bash
pnpm db:migrate

mkdir -p data
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_book_authors.json.gz -o data/authors.json.gz
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_books.json.gz -o data/books.json.gz

AUTHORS_DATA_PATH=./data/authors.json.gz TOTAL_AUTHORS=829529 pnpm db:seed-authors
BOOKS_DATA_PATH=./data/books.json.gz TOTAL_BOOKS=2360655 pnpm db:seed-books
```

`TOTAL_AUTHORS` and `TOTAL_BOOKS` are used for progress estimates and checkpoint reporting; the seeders process each input file to the end.

### Create a Neon subset

For a quota-limited Neon database, import a curated subset from a complete local PostgreSQL catalog. The importer selects the most-rated catalog-eligible books, inserts only their referenced authors, preserves complete book metadata, and stops if the target exceeds its configured soft storage limit:

```bash
pnpm db:migrate
pnpm db:seed-neon
```

The defaults import 100,000 books and enforce a 400 MB soft limit. Set `SOURCE_DATABASE_URL`, `TARGET_BOOKS`, or `TARGET_MAX_DATABASE_MB` to override them. `DATABASE_URL` always identifies the target database.
