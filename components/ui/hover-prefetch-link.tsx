'use client';

import { useState } from 'react';
import { FastLink } from '@/components/ui/fast-link';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof FastLink>, 'prefetch'> & {
  eager: boolean;
};

export function HoverPrefetchLink({ eager, onFocus, onMouseEnter, ...props }: Props) {
  const [intent, setIntent] = useState(false);

  return (
    <FastLink
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
