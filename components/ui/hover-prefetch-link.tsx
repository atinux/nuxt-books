'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'prefetch'> & {
  eager: boolean;
};

export function HoverPrefetchLink({ eager, onFocus, onMouseEnter, ...props }: Props) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={eager || intent ? true : 'auto'}
      onFocus={event => {
        setIntent(true);
        onFocus?.(event);
      }}
      onMouseEnter={event => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
    />
  );
}
