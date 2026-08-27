import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ className, rating }: { className?: string; rating: number }) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <span aria-label={`Rated ${rating.toFixed(1)} out of 5`} className={cn('inline-flex items-center gap-0.5', className)} role="img">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= rounded;
        const half = !filled && index + 0.5 === rounded;
        return (
          <Star
            aria-hidden
            className={cn(
              'size-4',
              filled || half ? 'text-warning fill-current' : 'text-divider dark:text-divider-dark fill-current',
            )}
            key={index}
            strokeWidth={0}
          />
        );
      })}
    </span>
  );
}
