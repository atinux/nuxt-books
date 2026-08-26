import { Suspense } from "react";
import { BookPagination } from "@/components/book-pagination";
import { BooksGrid, BooksGridSkeleton } from "@/components/grid";
import { getBooksPage, ITEMS_PER_PAGE } from "@/lib/db/queries";
import { parseSearchParams } from "@/lib/url-state";

type RawSearchParams = Record<string, string | string[] | undefined>;

export default function Page({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-primary mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
          Rediscover your next read
        </p>
        <h1 className="font-serif text-balance text-4xl leading-[0.98] font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
          Every shelf, a new direction.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-6 sm:text-base">
          Search, filter, and move through millions of books without losing your
          place—or waiting for the next page.
        </p>
      </div>

      <Suspense fallback={<BooksGridSkeleton />}>
        <BookResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BookResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const parsedSearchParams = parseSearchParams(await searchParams);
  const { books, total, preview } = await getBooksPage(parsedSearchParams);
  const currentPage = Math.max(1, Number(parsedSearchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <section aria-label="Books" className="book-enter">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-3">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
          {total.toLocaleString()} {total === 1 ? "volume" : "volumes"}
          {parsedSearchParams.search
            ? ` matching “${parsedSearchParams.search}”`
            : ""}
        </p>
        {preview ? (
          <p className="text-muted-foreground text-xs">
            Preview catalog · connect Postgres for the full collection
          </p>
        ) : null}
      </div>

      <BooksGrid books={books} searchParams={parsedSearchParams} />

      <BookPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={total}
        searchParams={parsedSearchParams}
      />
    </section>
  );
}
