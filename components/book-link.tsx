import type { Route } from 'next';
import { IntentPrefetchLink } from '@/components/intent-prefetch-link';
import { Photo } from '@/components/photo';
import { EMPTY_IMAGE_URL } from '@/lib/book';
import type { BookSummary } from '@/lib/db/queries';
import type { SearchParams } from '@/lib/url-state';
import { stringifySearchParams } from '@/lib/url-state';

export function BookLink({
  book,
  priority,
  searchParams,
}: {
  book: BookSummary;
  priority: boolean;
  searchParams: SearchParams;
}) {
  const query = stringifySearchParams(searchParams);
  const href = `/${book.id}${query ? `?${query}` : ''}` as Route;

  return (
    <IntentPrefetchLink
      href={href}
      className="block transition ease-in-out md:hover:scale-105"
    >
      <Photo
        src={book.image_url ?? EMPTY_IMAGE_URL}
        title={book.title}
        thumbhash={book.thumbhash}
        priority={priority}
      />
    </IntentPrefetchLink>
  );
}
