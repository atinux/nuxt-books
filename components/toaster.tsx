'use client';

import { useTheme } from 'next-themes';
import { ViewTransition } from 'react';
import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <ViewTransition default="none" name="toaster">
      <Sonner closeButton position="bottom-center" theme={resolvedTheme === 'light' ? 'light' : 'dark'} />
    </ViewTransition>
  );
}
