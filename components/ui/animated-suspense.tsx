import { Suspense, ViewTransition } from 'react';
import type { ReactNode } from 'react';

export function AnimatedSuspense({
  children,
  fallback,
  name,
}: {
  children: ReactNode;
  fallback: ReactNode;
  name: string;
}) {
  return (
    <Suspense
      fallback={
        <ViewTransition default="none" name={name} share="auto">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition default="none" name={name} share="auto">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
