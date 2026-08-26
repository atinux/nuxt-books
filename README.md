# Book Inventory 16

A modern revival of the original [Book Inventory](https://github.com/vercel-labs/book-inventory) demo. It browses the Goodreads catalog with a fast, URL-driven interface built around the latest Next.js navigation and caching model.

## What this demonstrates

- Next.js 16 Cache Components and Partial Prefetching
- A reusable App Shell for instant first visits
- Intent-based `prefetch={true}` for dynamic book pages
- Cached Postgres queries with `use cache`, cache lifetimes, and tags
- Streaming search and filter results behind focused Suspense boundaries
- React Compiler, typed routes, Turbopack, Tailwind CSS 4, and React 19
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

The original dataset contains more than two million Goodreads books. The schema uses the PostgreSQL `unaccent` and `vector` extensions:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS vector;
```

The source dataset is available from the [UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).
