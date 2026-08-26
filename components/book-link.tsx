'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Photo } from '@/components/photo';
import type { BookSummary } from '@/lib/db/queries';
import type { SearchParams } from '@/lib/url-state';
import { stringifySearchParams } from '@/lib/url-state';

const EMPTY_IMAGE_URL =
  'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png';

export function BookLink({
  book,
  priority,
  searchParams,
}: {
  book: BookSummary;
  priority: boolean;
  searchParams: SearchParams;
}) {
  const [intent, setIntent] = useState(false);
  const query = stringifySearchParams(searchParams);
  const href = `/${book.id}${query ? `?${query}` : ''}` as const;

  return (
    <Link
      href={href}
      prefetch={intent ? true : undefined}
      onPointerEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      className="block transition ease-in-out md:hover:scale-105"
    >
      <Photo
        src={book.image_url ?? EMPTY_IMAGE_URL}
        title={book.title}
        thumbhash={book.thumbhash}
        priority={priority}
      />
    </Link>
  );
}
