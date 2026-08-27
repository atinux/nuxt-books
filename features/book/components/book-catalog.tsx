import { getBooksPage } from '@/features/book/book-queries';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { getCurrentPage, getTotalPages } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';
import type { ReactNode } from 'react';

export async function BookCatalog({ searchParams }: { searchParams: SearchParams }) {
  const { books, total } = await getBooksPage(searchParams);
  const totalPages = getTotalPages(total);

  return (
    <Frame
      footer={
        <BookPagination
          currentPage={getCurrentPage(searchParams, totalPages)}
          searchParams={searchParams}
          totalPages={totalPages}
          totalResults={total}
        />
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

/**
 * Shared geometry for the catalog and its skeleton, so the App Shell paints the
 * skeleton and swaps to real covers without a layout shift.
 *
 * The grid dims off `data-filtering` only. Keying it off `data-pending` would also
 * catch every `useLinkStatus` in the tree, which made the grid flash grey on any
 * back-navigation from a cached book page.
 */
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
