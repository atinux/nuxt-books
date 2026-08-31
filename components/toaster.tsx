'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();

  // The view-transition name lives on this always-mounted wrapper, so toasts are
  // excluded from the navigation snapshot instead of being captured mid-flight.
  return (
    <div className="pointer-events-none fixed inset-0 z-9999" style={{ viewTransitionName: 'toaster' }}>
      <SonnerToaster position="bottom-right" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
    </div>
  );
}
