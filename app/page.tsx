import { Suspense } from 'react';
import { AnimatedSuspense } from '@/components/ui/animated-suspense';
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
          <AnimatedSuspense fallback={<BookGridSkeleton />}>
            {searchParams.then(params => (
              <BookResults searchParams={parseSearchParams(params)} />
            ))}
          </AnimatedSuspense>
        </div>
        <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
          <Suspense fallback={<BookPaginationSkeleton />}>
            {searchParams.then(params => (
              <BookPagination searchParams={parseSearchParams(params)} />
            ))}
          </Suspense>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

async function BookResults({ searchParams }: { searchParams: SearchParams }) {
  const books = await getBooksPage(toBookQuery(searchParams));

  return <BookGrid books={books} searchParams={searchParams} />;
}
