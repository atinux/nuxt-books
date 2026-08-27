'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Route } from 'next';
import type { ComponentProps } from 'react';

type Props<T extends string = string> = Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & {
  href: Route<T> | URL;
};

// For dense lists, so N links don't each wake a server on render.
export function HoverPrefetchLink<T extends string>({ href, onFocus, onPointerEnter, ...props }: Props<T>) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      href={href as Route}
      onFocus={event => {
        setIntent(true);
        onFocus?.(event);
      }}
      onPointerEnter={event => {
        setIntent(true);
        onPointerEnter?.(event);
      }}
      prefetch={intent ? true : undefined}
    />
  );
}
