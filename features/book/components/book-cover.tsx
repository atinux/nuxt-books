import Image from 'next/image';
import { createPngDataUri } from 'unlazy/thumbhash';
import { EMPTY_IMAGE_URL, getLargeBookImageUrl } from '@/features/book/book-constants';
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

// The shared `book-cover-<id>` name pairs grid and detail hero; `share` hands the
// pair to the geometry-only recipe in globals.css.
export function BookCover({ bookId, className, priority, sizes, src, thumbhash, title }: Props) {
  return (
    <div className={cn('bg-card dark:bg-card-dark relative aspect-[2/3] w-full overflow-hidden rounded-md', className)}>
      <Image
        alt={title}
        blurDataURL={thumbhash ? createPngDataUri(thumbhash) : undefined}
        className="object-cover"
        fill
        placeholder={thumbhash ? 'blur' : 'empty'}
        priority={priority}
        sizes={sizes}
        src={getLargeBookImageUrl(src ?? EMPTY_IMAGE_URL)}
      />
    </div>
  );
}

export function BookCoverSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('skeleton-subtle aspect-[2/3] w-full rounded-md', className)} />;
}
