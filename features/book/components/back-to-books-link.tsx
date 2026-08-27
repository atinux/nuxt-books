'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LinkStatus } from '@/components/ui/link-status';
import { buildHref, parseSearchParams } from '@/lib/url-state';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

const linkClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark -ml-1.5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-black dark:hover:text-white';

/**
 * "Back to books" that keeps the grid's filters.
 *
 * `useSearchParams` is dynamic under `cacheComponents`, so it needs a Suspense
 * boundary. This one is a *read* boundary, not a data boundary: the fallback renders
 * the identical link pointing at `/`, so the shell paints the final layout and only
 * the `href` upgrades once the params resolve. Nothing moves. Same shape as the
 * `NavLink` primitive in the demos this app borrows from.
 */
export function BackToBooksLink({ className }: { className?: string }) {
  return (
    <Suspense fallback={<BackLink className={className} href="/" />}>
      <BackLinkWithFilters className={className} />
    </Suspense>
  );
}

function BackLinkWithFilters({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const href = buildHref(parseSearchParams(Object.fromEntries(searchParams)));
  return <BackLink className={className} href={href} />;
}

function BackLink({ className, href }: { className?: string; href: Route }) {
  return (
    <Link className={cn(linkClass, className)} href={href} prefetch>
      <LinkStatus>
        <ArrowLeft aria-hidden className="size-4" />
        Back to books
      </LinkStatus>
    </Link>
  );
}
