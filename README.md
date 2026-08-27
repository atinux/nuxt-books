# Book Inventory 16

A modern revival of the original [Book Inventory](https://github.com/vercel-labs/book-inventory) demo. It browses the Goodreads catalog with a fast, URL-driven interface built around the latest Next.js navigation and caching model.

## What this demonstrates

- Next.js 16 Cache Components and Partial Prefetching
- A reusable App Shell for instant first visits
- Intent-based `prefetch={true}` for dynamic book pages
- Cached Postgres queries with `use cache` and explicit cache lifetimes
- Streaming search and filter results behind focused Suspense boundaries
- React Compiler, typed routes, Turbopack, Tailwind CSS, and React 19
- `@next/playwright` regression tests for instant navigation

## Run locally

```bash
pnpm install
pnpm dev
```

Without environment variables, the app runs against a small preview catalog so contributors can develop and run tests immediately. Add `POSTGRES_URL` to use the full Neon/Postgres database.

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test:e2e
pnpm build
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
