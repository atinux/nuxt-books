import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import ErrorBoundary from '@/components/ui/error-boundary';
import { getBooksPage } from '@/features/book/book-queries';
import { toBookQuery } from '@/features/book/book-utils';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { parseSearchParams } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

export default function Page({ searchParams }: PageProps<'/'>) {
  return (
    <ErrorBoundary
      body="The catalog query failed. Check your database connection and try again."
      title="Can't load books"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
          <Suspense fallback={<BookGridSkeleton />}>
            <Crossfade>
              {searchParams.then(params => (
                <BookResults searchParams={parseSearchParams(params)} />
              ))}
            </Crossfade>
          </Suspense>
        </div>
        <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
          <Suspense fallback={<BookPaginationSkeleton />}>
            <Crossfade>
              {searchParams.then(params => (
                <BookPagination searchParams={parseSearchParams(params)} />
              ))}
            </Crossfade>
          </Suspense>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

async function BookResults({ searchParams }: { searchParams: SearchParams }) {
  const query = toBookQuery(searchParams);
  const books = await getBooksPage(
    query.page,
    query.search,
    query.year,
    query.rating,
    query.language,
    query.maxPages,
    query.isbns,
  );

  return <BookGrid books={books} searchParams={searchParams} />;
}
