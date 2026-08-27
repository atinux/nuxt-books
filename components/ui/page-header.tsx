import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LinkStatus } from '@/components/ui/link-status';
import { cn } from '@/lib/utils';
import type { Route } from 'next';
import type { ReactNode } from 'react';

type Props = {
  backHref?: Route;
  backLabel?: string;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ backHref, backLabel = 'Back to books', children, className }: Props) {
  return (
    <header className={cn('flex items-center gap-3', className)}>
      {backHref ? (
        <Link
          className="text-muted hover:bg-card dark:hover:bg-card-dark -ml-1.5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
          href={backHref}
        >
          <LinkStatus>
            <ArrowLeft aria-hidden className="size-4" />
            {backLabel}
          </LinkStatus>
        </Link>
      ) : null}
      {children}
    </header>
  );
}
