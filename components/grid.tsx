import { BookMarked } from "lucide-react";
import { BookLink } from "@/components/book-link";
import type { BookSummary } from "@/lib/db/queries";
import type { SearchParams } from "@/lib/url-state";

export function BooksGrid({
  books,
  searchParams,
}: {
  books: BookSummary[];
  searchParams: SearchParams;
}) {
  if (!books.length) {
    return (
      <div className="border-border/80 bg-card/55 grid min-h-80 place-items-center rounded-3xl border border-dashed px-6 text-center">
        <div>
          <BookMarked className="text-primary/55 mx-auto mb-4 size-8" />
          <h2 className="font-serif text-2xl">That shelf is empty.</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Try a broader search or clear a filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {books.map((book, index) => (
        <BookLink
          key={book.id}
          book={book}
          priority={index < 8}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

export function BooksGridSkeleton() {
  return (
    <div aria-label="Loading books" aria-busy="true">
      <div className="mb-5 h-11 animate-pulse border-y" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 18 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted aspect-[2/3] rounded-[1.1rem]" />
            <div className="bg-muted mt-3 h-3 w-3/4 rounded-full" />
            <div className="bg-muted mt-2 h-2.5 w-2/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
