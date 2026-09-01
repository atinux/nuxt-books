<div align="center">

<img src="public/logo.svg" alt="NuxtBooks" width="72" height="72" />

# NuxtBooks

NuxtBooks is built from a Goodreads dataset of more than 2,000,000 books. The catalog uses Nuxt 4, Vue, Nitro, Drizzle, Turso, and incremental static regeneration (ISR).

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

`TURSO_DATABASE_URL` is optional. Without it, NuxtBooks serves a generated preview catalog.

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

Turso Cloud is compatible with libSQL and SQLite. NuxtBooks uses Drizzle's libSQL driver and an FTS5 index with Unicode diacritic removal for accent-insensitive title search.

Local development doesn't require a Turso account. Create `.env` from `.env.example`; `file:local.db` uses an on-disk SQLite database, and the auth token remains empty:

```dotenv
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
```

Create the schema and load the bundled four-book sample:

```bash
pnpm db:setup
```

Optionally generate cover-image placeholders for the four bundled sample books:

```bash
pnpm db:seed-thumbhash
```

To use Turso Cloud, [create a database and token](https://docs.turso.tech/quickstart), then set the credentials locally and in your deployment:

```dotenv
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-database-token
```

Run `pnpm db:migrate` against a new Turso database before starting the app. See the [Drizzle and Turso guide](https://orm.drizzle.team/docs/tutorials/drizzle-with-turso) for more connection details.

To import the complete UCSD Goodreads catalog, download the compressed book and author metadata files into the ignored `data/` directory. The seeders work with local files and hosted Turso databases, read gzip files directly, preserve Goodreads IDs, and checkpoint large imports:

```bash
pnpm db:migrate

mkdir -p data
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_book_authors.json.gz -o data/authors.json.gz
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_books.json.gz -o data/books.json.gz

AUTHORS_DATA_PATH=./data/authors.json.gz TOTAL_AUTHORS=829529 pnpm db:seed-authors
BOOKS_DATA_PATH=./data/books.json.gz TOTAL_BOOKS=2360655 pnpm db:seed-books
```

`TOTAL_AUTHORS` and `TOTAL_BOOKS` are used for progress estimates and checkpoint reporting; the seeders process each input file to the end.
