import { EmptyState } from '@/components/ui/empty-state';
import { ITEMS_PER_PAGE } from '@/features/book/book-constants';
import { BookCard, BookCardSkeleton } from '@/features/book/components/book-card';
import type { BookSummary } from '@/features/book/book-queries';
import { getCurrentPage, type SearchParams } from '@/lib/url-state';

const gridClass = 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';

export function BookGrid({ books, searchParams }: { books: BookSummary[]; searchParams: SearchParams }) {
  if (books.length === 0) {
    return (
      <EmptyState
        body="Nothing matched these filters. Try widening the year range or clearing the search."
        title="No books found"
      />
    );
  }

  const eagerPrefetch = getCurrentPage(searchParams) === 1;

  return (
    <div className={gridClass}>
      {books.map((book, index) => (
        <BookCard
          book={book}
          eagerPrefetch={eagerPrefetch}
          key={book.id}
          priority={index < 10}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

export function BookGridSkeleton({ count = ITEMS_PER_PAGE }: { count?: number }) {
  return (
    <div aria-hidden className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}
