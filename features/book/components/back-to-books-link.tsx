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

// `useSearchParams` needs a boundary under `cacheComponents`. The fallback is the
// same link pointing at `/`, so only the `href` upgrades and nothing moves.
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
