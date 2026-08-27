import { BookOpen, Building2, CalendarDays, Globe, Hash } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { BookCover, BookCoverSkeleton } from '@/features/book/components/book-cover';
import { getBookById } from '@/features/book/book-queries';
import { formatCount, getLanguageLabel } from '@/features/book/book-utils';
import type { ReactNode } from 'react';

const DETAIL_SIZES = '(min-width: 768px) 18rem, 60vw';

export async function BookDetail({ id }: { id: string }) {
  const book = await getBookById(id);
  if (!book) notFound();

  const rating = Number(book.average_rating);
  const hasRating = book.average_rating !== null && !Number.isNaN(rating);

  return (
    <article className="flex flex-col gap-8 md:flex-row md:gap-10">
      <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-72">
        <BookCover
          bookId={book.id}
          className="shadow-soft ring-divider/70 dark:ring-divider-dark/70 ring-1"
          priority
          sizes={DETAIL_SIZES}
          src={book.image_url}
          thumbhash={book.thumbhash}
          title={book.title}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h1>{book.title}</h1>
        {book.authors.length > 0 ? (
          <p className="text-muted mt-2 text-base sm:text-lg">{book.authors.join(', ')}</p>
        ) : null}

        {hasRating ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating rating={rating} />
            <span className="text-sm font-semibold tabular-nums">{rating.toFixed(1)}</span>
            {book.ratings_count ? (
              <span className="text-muted text-sm tabular-nums">{formatCount(book.ratings_count)} ratings</span>
            ) : null}
          </div>
        ) : null}

        {book.description ? <p className="text-muted mt-6 max-w-prose text-sm leading-7">{book.description}</p> : null}

        <dl className="border-divider dark:border-divider-dark mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t pt-6 sm:grid-cols-2">
          <Fact icon={<BookOpen aria-hidden className="size-4" />} label="Pages">
            {book.num_pages ? book.num_pages.toLocaleString() : 'Unknown'}
          </Fact>
          <Fact icon={<Globe aria-hidden className="size-4" />} label="Language">
            {getLanguageLabel(book.language_code)}
          </Fact>
          <Fact icon={<CalendarDays aria-hidden className="size-4" />} label="Published">
            {book.publication_year ?? 'Unknown'}
          </Fact>
          <Fact icon={<Building2 aria-hidden className="size-4" />} label="Publisher">
            {book.publisher ?? 'Unknown'}
          </Fact>
          <Fact icon={<Hash aria-hidden className="size-4" />} label="ISBN">
            <span className="font-mono text-xs">{book.isbn ?? 'None'}</span>
          </Fact>
        </dl>
      </div>
    </article>
  );
}

function Fact({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <dt className="text-muted text-xs font-semibold tracking-wide uppercase">{label}</dt>
        <dd className="mt-0.5 truncate text-sm">{children}</dd>
      </div>
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-8 md:flex-row md:gap-10">
      <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-72">
        <BookCoverSkeleton />
      </div>
      <div className="min-w-0 flex-1">
        <Skeleton className="skeleton-subtle h-8 w-3/4 max-w-md" />
        <Skeleton className="skeleton-subtle mt-3 h-5 w-40" />
        <Skeleton className="skeleton-subtle mt-5 h-4 w-56" />
        <div className="mt-6 flex flex-col gap-2.5">
          <Skeleton className="skeleton-subtle h-3.5 w-full max-w-prose" />
          <Skeleton className="skeleton-subtle h-3.5 w-full max-w-prose" />
          <Skeleton className="skeleton-subtle h-3.5 w-4/5 max-w-prose" />
        </div>
        <div className="border-divider dark:border-divider-dark mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t pt-6 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="flex items-start gap-3" key={index}>
              <Skeleton className="skeleton-subtle mt-0.5 size-4 rounded" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="skeleton-subtle h-3 w-16" />
                <Skeleton className="skeleton-subtle h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
