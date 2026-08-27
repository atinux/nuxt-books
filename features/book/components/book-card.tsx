import { HoverPrefetchLink } from '@/components/ui/hover-prefetch-link';
import { BookCover, BookCoverSkeleton } from '@/features/book/components/book-cover';
import { buildHref } from '@/lib/url-state';
import type { BookSummary } from '@/features/book/book-queries';
import type { SearchParams } from '@/lib/url-state';
import type { Route } from 'next';

const GRID_SIZES =
  '(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw';

type Props = {
  book: BookSummary;
  priority: boolean;
  searchParams: SearchParams;
};

export function BookCard({ book, priority, searchParams }: Props) {
  // Carry the current filters into the detail route so "back" restores the exact grid.
  const back = buildHref(searchParams);
  const href = (back === '/' ? `/${book.id}` : `/${book.id}?${back.slice(2)}`) as Route;

  return (
    <HoverPrefetchLink
      className="focus-visible:ring-action focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface-dark group relative block rounded-md transition-transform duration-200 ease-out hover:z-10 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      href={href}
      transitionTypes={['nav-forward']}
    >
      <BookCover
        bookId={book.id}
        className="group-hover:shadow-soft transition-shadow"
        priority={priority}
        sizes={GRID_SIZES}
        src={book.image_url}
        thumbhash={book.thumbhash}
        title={book.title}
      />
      <span className="sr-only">{book.title}</span>
    </HoverPrefetchLink>
  );
}

export function BookCardSkeleton() {
  return <BookCoverSkeleton />;
}
