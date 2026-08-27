import { Suspense } from 'react';
import { getBooksPage } from '@/features/book/book-queries';
import { toBookQuery } from '@/features/book/book-utils';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import type { SearchParams } from '@/lib/url-state';
import type { ReactNode } from 'react';

export async function BookCatalog({ searchParams }: { searchParams: SearchParams }) {
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

  return (
    <Frame
      footer={
        <Suspense fallback={<BookPaginationSkeleton />}>
          <BookPagination searchParams={searchParams} />
        </Suspense>
      }
    >
      <BookGrid books={books} searchParams={searchParams} />
    </Frame>
  );
}

export function BookCatalogSkeleton() {
  return (
    <Frame footer={<BookPaginationSkeleton />}>
      <BookGridSkeleton />
    </Frame>
  );
}

function Frame({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
        {children}
      </div>
      <div className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">{footer}</div>
    </div>
  );
}
