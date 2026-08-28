'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LinkStatus } from '@/components/ui/link-status';
import { buildHref, getCurrentPage, parseSearchParams } from '@/lib/url-state';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

const linkClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark -ml-1.5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-black dark:hover:text-white';

// The fallback is the same link pointing at `/`, so only the `href` upgrades.
export function BackToBooksLink({ className }: { className?: string }) {
  return (
    <Suspense fallback={<BackLink className={className} eager href="/" />}>
      <BackLinkWithFilters className={className} />
    </Suspense>
  );
}

function BackLinkWithFilters({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const params = parseSearchParams(Object.fromEntries(searchParams));
  const href = buildHref(params);
  return <BackLink className={className} eager={getCurrentPage(params) === 1} href={href} />;
}

function BackLink({ className, eager, href }: { className?: string; eager: boolean; href: Route }) {
  return (
    <Link className={cn(linkClass, className)} href={href} prefetch={eager ? true : 'auto'}>
      <LinkStatus>
        <ArrowLeft aria-hidden className="size-4" />
        Back to books
      </LinkStatus>
    </Link>
  );
}
