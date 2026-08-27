import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LinkStatus } from '@/components/ui/link-status';
import { buildHref, withPage } from '@/lib/url-state';
import { cn } from '@/lib/utils';
import type { SearchParams } from '@/lib/url-state';

type Props = {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  searchParams: SearchParams;
};

const stepClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark focus-visible:ring-action/40 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white';

export function BookPagination({ currentPage, searchParams, totalPages, totalResults }: Props) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      {hasPrevious ? (
        <Link className={stepClass} href={buildHref(withPage(searchParams, currentPage - 1))} scroll={false}>
          <LinkStatus>
            <ChevronLeft aria-hidden className="size-4" />
            Previous
          </LinkStatus>
        </Link>
      ) : (
        <span aria-disabled className={cn(stepClass, 'pointer-events-none opacity-40')}>
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </span>
      )}

      <p className="text-muted text-xs tabular-nums sm:text-sm">
        <span className="font-medium text-black dark:text-white">{totalResults.toLocaleString()}</span> books · page{' '}
        {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
      </p>

      {hasNext ? (
        <Link className={stepClass} href={buildHref(withPage(searchParams, currentPage + 1))} scroll={false}>
          <LinkStatus>
            Next
            <ChevronRight aria-hidden className="size-4" />
          </LinkStatus>
        </Link>
      ) : (
        <span aria-disabled className={cn(stepClass, 'pointer-events-none opacity-40')}>
          Next
          <ChevronRight aria-hidden className="size-4" />
        </span>
      )}
    </nav>
  );
}

export function BookPaginationSkeleton() {
  return <div aria-hidden className="h-8" />;
}
