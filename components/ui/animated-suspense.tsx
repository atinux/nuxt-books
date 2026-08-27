import { Suspense, ViewTransition } from 'react';
import type { ReactNode } from 'react';

type AnimatedSuspenseProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function AnimatedSuspense({ children, fallback }: AnimatedSuspenseProps) {
  return (
    <Suspense
      fallback={
        <ViewTransition default="none" exit="auto">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition default="none" enter="auto">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
