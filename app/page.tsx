import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import ErrorBoundary from '@/components/ui/error-boundary';
import { getBooksPage } from '@/features/book/book-queries';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { getCurrentPage, getTotalPages, parseSearchParams } from '@/lib/url-state';
import type { RawSearchParams } from '@/lib/url-state';

export default function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <ErrorBoundary
      body="The catalog query failed. Check your database connection and try again."
      title="Can't load books"
    >
      <Suspense fallback={<CatalogSkeleton />}>
        <Crossfade>
          <BookResults searchParams={searchParams} />
        </Crossfade>
      </Suspense>
    </ErrorBoundary>
  );
}

async function BookResults({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const parsed = parseSearchParams(await searchParams);
  const { books, total } = await getBooksPage(parsed);
  const totalPages = getTotalPages(total);

  return (
    <CatalogLayout
      footer={
        <BookPagination
          currentPage={getCurrentPage(parsed, totalPages)}
          searchParams={parsed}
          totalPages={totalPages}
          totalResults={total}
        />
      }
    >
      <BookGrid books={books} searchParams={parsed} />
    </CatalogLayout>
  );
}

/**
 * Shared frame so the streamed grid and its skeleton occupy identical geometry —
 * the App Shell paints the skeleton, then swaps without a layout shift.
 */
function CatalogLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-pending]]:opacity-60 sm:px-6">
        {children}
      </div>
      <div className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">{footer}</div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <CatalogLayout footer={<BookPaginationSkeleton />}>
      <BookGridSkeleton />
    </CatalogLayout>
  );
}
