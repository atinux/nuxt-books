import { BookLink } from '@/components/book-link';
import type { BookSummary } from '@/lib/db/queries';
import type { SearchParams } from '@/lib/url-state';

export function BooksGrid({
  books,
  searchParams,
}: {
  books: BookSummary[];
  searchParams: SearchParams;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {!books?.length ? (
        <p className="text-center text-muted-foreground col-span-full">
          No books found.
        </p>
      ) : (
        books.map((book, index) => (
          <BookLink
            key={book.id}
            priority={index < 10}
            book={book}
            searchParams={searchParams}
          />
        ))
      )}
    </div>
  );
}
