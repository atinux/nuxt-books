'use client';

import { useLinkStatus } from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'dim' | 'spinner';
};

/**
 * Reflects the enclosing `<Link>`'s navigation state. `spinner` swaps in a spinner
 * beside the label; `dim` fades the label and exposes `data-pending` for ancestors.
 */
export function LinkStatus({ children, className, variant = 'spinner' }: Props) {
  const { pending } = useLinkStatus();

  if (variant === 'dim') {
    return (
      <span
        className={cn('transition-opacity duration-200 ease-out data-pending:opacity-50', className)}
        data-pending={pending ? '' : undefined}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)} data-pending={pending ? '' : undefined}>
      {children}
      {pending ? <Spinner className="size-3.5" /> : null}
    </span>
  );
}
