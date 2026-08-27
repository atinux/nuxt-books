import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

/**
 * Crossfades content on Suspense reveal. Wraps `<ViewTransition enter="auto" default="none">`
 * so the animation only fires when suspended content streams in — not during unrelated transitions.
 */
export function Crossfade({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="auto">
      {children}
    </ViewTransition>
  );
}
