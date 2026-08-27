'use client';

import { useLinkStatus } from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function LinkStatus({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {children}
      <span aria-hidden className="link-hint size-3.5 shrink-0" data-pending={pending ? '' : undefined}>
        {pending ? <Spinner className="size-3.5" /> : null}
      </span>
    </span>
  );
}
