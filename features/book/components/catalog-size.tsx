import { Skeleton } from '@/components/ui/skeleton';
import { getCatalogSize } from '@/features/book/book-queries';

export async function CatalogSize() {
  const total = await getCatalogSize();

  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{total.toLocaleString()}</p>
      <p className="text-muted mt-1 text-xs leading-5">
        books from Goodreads. Built on Next.js 16.3 Instant Navigations.
      </p>
    </div>
  );
}

export function CatalogSizeSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-4/5" />
    </div>
  );
}
