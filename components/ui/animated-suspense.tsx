import { Suspense, ViewTransition } from 'react';
import type { ReactNode } from 'react';

type AnimatedSuspenseProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function AnimatedSuspense({ children, fallback }: AnimatedSuspenseProps) {
  return (
    <ViewTransition default="none" update="auto">
      <Suspense fallback={fallback}>{children}</Suspense>
    </ViewTransition>
  );
}
