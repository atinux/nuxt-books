'use client';

import { useLinkStatus } from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  hint?: 'end' | 'start';
};

export function LinkStatus({ children, className, hint = 'end' }: Props) {
  const { pending } = useLinkStatus();

  const slot = (
    <span
      aria-hidden
      className="pending-hint inline-flex size-3.5 shrink-0 items-center justify-center"
      data-pending={pending ? '' : undefined}
    >
      {pending ? <Spinner className="size-3.5" /> : null}
    </span>
  );

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {hint === 'start' ? slot : null}
      {children}
      {hint === 'end' ? slot : null}
    </span>
  );
}
