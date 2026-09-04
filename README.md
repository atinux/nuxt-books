<div align="center">

<img src="public/logo.svg" alt="NuxtBooks" width="72" height="72" />

# NuxtBooks

NuxtBooks serves a curated catalog of 100,000 Goodreads books that fits within the free Neon database tier. The catalog uses Nuxt 4, Vue, Nitro, Drizzle, and PostgreSQL.

[**View the source on GitHub →**](https://github.com/atinux/nuxt-books)

</div>

---

NuxtBooks is a rebuild of [NextBooks](https://github.com/vercel-labs/next-books), but with [Nuxt](https://github.com/nuxt/nuxt). You can download the [full Goodreads dataset from the UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).

## Navigation and caching

Catalog and book pages render dynamically rather than using ISR. On Vercel, Nitro mounts its `cache` storage on [Vercel Runtime Cache](https://vercel.com/docs/caching/runtime-cache); local and test builds use Nitro's in-memory fallback.

- **Cached API data:** `/api/books`, `/api/books/count`, and `/api/books/:id` use `defineCachedEventHandler` with a one-hour stale-while-revalidate window. Stable hashed keys are derived from normalized filters, pagination, or the book ID so equivalent requests share an entry.
- **Runtime Cache namespace:** Vercel entries use the versioned `nuxt-books:v1` namespace. Bumping the version intentionally starts a fresh cache.
- **Dynamic page payloads:** the header-only `routeRules` cache marker keeps page rendering dynamic while allowing Nuxt to expose and browser-cache runtime `_payload.json` responses for client navigation. `/api/**` is excluded because the handlers own their cache policy.
- **Book prefetching:** first-page book links prefetch when they enter the viewport. Books on later catalog pages wait for pointer or keyboard intent.
- **Pagination warming:** when the pagination controls enter the viewport, the app requests adjacent `/api/books` query variants so their Runtime Cache entries are warm before navigation. The navigation itself still fetches the extracted `_payload.json` route.
- **Forward compatibility:** `future.compatibilityVersion: 5` opts into the documented Nuxt 5 defaults while the app remains on Nuxt 4.

See [Nitro caching](https://nitro.build/docs/cache), [Nuxt payload extraction](https://nuxt.com/docs/4.x/getting-started/prerendering#payload-extraction), and [`<NuxtLink>` prefetching](https://nuxt.com/docs/4.x/api/components/nuxt-link#prefetch-links) for the underlying behavior.

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

The Playwright suite runs against a production Nitro build. It exercises the in-memory version of the cached handlers plus extracted-payload navigation and prefetching, not only development-server behavior.

```bash
pnpm test:e2e
```

Only a Vercel preview deployment uses the actual Runtime Cache backend. Use the Runtime Cache section of Vercel Observability to verify reads, writes, and hit rates after changing cache storage or keys.

## Database

The original dataset contains more than two million Goodreads books. The schema uses PostgreSQL's `unaccent` extension for accent-insensitive title search.

Connect a Neon database through the Vercel Marketplace, or set `DATABASE_URL` to another PostgreSQL connection string. Then create the schema and load the bundled four-book sample:

```bash
pnpm db:setup
```

Optionally generate cover-image placeholders for the four bundled sample books:

```bash
pnpm db:seed-thumbhash
```

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

For a quota-limited Neon database, import a curated subset from a complete local PostgreSQL catalog instead of loading every author and book. The importer selects the most-rated catalog-eligible books, inserts only their referenced authors, preserves complete book metadata, and stops if the target exceeds its configured soft storage limit:

```bash
pnpm db:migrate
pnpm db:seed-neon
```

The defaults import 100,000 books and enforce a 400 MB soft limit. Set `SOURCE_DATABASE_URL`, `TARGET_BOOKS`, or `TARGET_MAX_DATABASE_MB` to override them. `DATABASE_URL` always identifies the target database.
