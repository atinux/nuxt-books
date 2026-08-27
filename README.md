# Book Inventory 16

Demo: https://book-inventory-16.labs.vercel.dev

This is a book inventory app built with Next.js, Drizzle, and PostgreSQL. The database contains over 2,000,000 books from Goodreads. [Full dataset here](https://mengtingwan.github.io/data/goodreads.html).

It rebuilds [vercel-labs/book-inventory](https://github.com/vercel-labs/book-inventory), now archived, on [Next.js 16.3](https://nextjs.org/blog/next-16-3-instant-navigations) to show [Instant Navigations](https://nextjs.org/docs/app/guides/instant-navigation) at this scale.

## Instant navigations

- **[Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)** cache each query with `'use cache'` and set its lifetime with `cacheLife`, so a filtered page of books comes from the cache instead of querying Postgres again. See [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components).
- **[Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)** prefetches the shared App Shell of links as they enter the viewport, so navigation commits instantly and the data streams in behind it.
- **[Hover-triggered prefetch](https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch)** defers a link's [runtime prefetch](https://nextjs.org/docs/app/guides/runtime-prefetching) until the pointer or focus reaches it, so a page of 28 covers does not prefetch every destination on render.

## Run locally

```bash
pnpm install
pnpm dev
```

Without environment variables, the app runs against a small preview catalog so contributors can develop and run tests immediately. Add `POSTGRES_URL` to use the full Neon/Postgres database.

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Testing

The end-to-end tests use [`@next/playwright`](https://nextjs.org/docs/app/guides/testing/playwright) with the [`instant()`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant) API to assert that loading states appear and that navigations stay instant, and they run in CI. They use the preview catalog, so no database is needed.

```bash
pnpm test:e2e
```

## Database

The original dataset contains more than two million Goodreads books. The schema uses PostgreSQL's `unaccent` extension for accent-insensitive title search:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

The source dataset is available from the [UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).

Set `POSTGRES_URL`, then create the schema and load the bundled four-book sample:

```bash
pnpm db:setup
```

Optionally generate the cover-image placeholders after seeding:

```bash
pnpm db:seed-thumbhash
```

To import the complete UCSD Goodreads catalog, download the compressed book
and author metadata files into the ignored `data/` directory. The seeders read
gzip files directly, preserve Goodreads IDs, and checkpoint large imports:

```bash
mkdir -p data
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_book_authors.json.gz -o data/authors.json.gz
curl -L https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_books.json.gz -o data/books.json.gz

AUTHORS_DATA_PATH=./data/authors.json.gz TOTAL_AUTHORS=829529 pnpm db:seed-authors
BOOKS_DATA_PATH=./data/books.json.gz TOTAL_BOOKS=2360655 pnpm db:seed-books
```
