<div align="center">

<img src="public/logo.svg" alt="NuxtBooks" width="72" height="72" />

# NuxtBooks

NuxtBooks is built from a Goodreads dataset of more than 2,000,000 books. The catalog uses Nuxt 4, Vue, Nitro, Drizzle, PostgreSQL, and incremental static regeneration (ISR).

[**View the source on GitHub →**](https://github.com/atinux/nuxt-books)

</div>

---

NuxtBooks is a Nuxt rebuild of the archived [Vercel book inventory example](https://github.com/vercel-labs/book-inventory). You can download the [full Goodreads dataset from the UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).

## Navigation and caching

NuxtBooks uses [Nuxt route rules](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering) to cache page routes with a one-hour ISR window. API routes remain dynamic.

- **Extracted payloads:** `experimental.payloadExtraction: 'client'` keeps the payload inline on an initial request and exposes `_payload.json` for client navigation to cached routes.
- **Book prefetching:** first-page book links prefetch when they enter the viewport. Books on later catalog pages wait for pointer or keyboard intent.
- **Pagination prefetching:** the app explicitly warms the adjacent query route's `_payload.json`, because pagination changes the query string without changing the page component.
- **Forward compatibility:** `future.compatibilityVersion: 5` opts into the documented Nuxt 5 defaults while the app remains on Nuxt 4.

See [Nuxt payload extraction](https://nuxt.com/docs/4.x/getting-started/prerendering#payload-extraction) and [`<NuxtLink>` prefetching](https://nuxt.com/docs/4.x/api/components/nuxt-link#prefetch-links) for the underlying behavior.

## Run locally

You need Node.js 22 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

`POSTGRES_URL` is optional. Without it, NuxtBooks serves a generated preview catalog.

Verify a change with these commands:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Testing

The Playwright suite runs against a production Nitro build so it exercises ISR and extracted-payload prefetching, not only development-server behavior.

```bash
pnpm test:e2e
```

## Database

The original dataset contains more than two million Goodreads books. The schema uses PostgreSQL's `unaccent` extension for accent-insensitive title search:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Set `POSTGRES_URL`, then create the schema and load the bundled sample:

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
