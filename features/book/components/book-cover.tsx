import Image from 'next/image';
import { createPngDataUri } from 'unlazy/thumbhash';
import { Skeleton } from '@/components/ui/skeleton';
import { EMPTY_IMAGE_URL, getLargeBookImageUrl } from '@/features/book/book-constants';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  src: string | null;
  thumbhash: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function BookCover({ className, priority, sizes, src, thumbhash, title }: Props) {
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
