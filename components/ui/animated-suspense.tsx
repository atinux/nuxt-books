import { Suspense, ViewTransition } from 'react';
import type { ReactNode } from 'react';

type AnimatedSuspenseProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function AnimatedSuspense({ children, fallback }: AnimatedSuspenseProps) {
  return (
    <Suspense fallback={fallback}>
      <ViewTransition default="none" enter="auto">
        <div>{children}</div>
      </ViewTransition>
    </Suspense>
  );
}
