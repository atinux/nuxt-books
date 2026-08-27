import Image from 'next/image';
import { ViewTransition } from 'react';
import { createPngDataUri } from 'unlazy/thumbhash';
import { EMPTY_IMAGE_URL } from '@/features/book/book-constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Props = {
  bookId: number;
  title: string;
  src: string | null;
  thumbhash: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * A book cover that morphs between the grid and the detail hero. The shared
 * `book-cover-<id>` name pairs the two, and `share="book-cover"` hands the
 * transition to the geometry-only recipe in `globals.css`.
 */
export function BookCover({ bookId, className, priority, sizes, src, thumbhash, title }: Props) {
  return (
    <ViewTransition default="none" name={`book-cover-${bookId}`} share="book-cover">
      <div
        className={cn('bg-card dark:bg-card-dark relative aspect-[2/3] w-full overflow-hidden rounded-md', className)}
      >
        <Image
          alt={title}
          blurDataURL={thumbhash ? createPngDataUri(thumbhash) : undefined}
          className="object-cover"
          fill
          placeholder={thumbhash ? 'blur' : 'empty'}
          priority={priority}
          sizes={sizes}
          src={src ?? EMPTY_IMAGE_URL}
        />
      </div>
    </ViewTransition>
  );
}

export function BookCoverSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('aspect-[2/3] w-full rounded-md', className)} />;
}
