'use client';

import { Suspense, ViewTransition, useCallback, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';

type AnimatedSuspenseProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function AnimatedSuspense({ children, fallback }: AnimatedSuspenseProps) {
  const [reveal, setReveal] = useState(0);
  const markFallbackVisible = useCallback(() => {
    setReveal(current => current + 1);
  }, []);

  return (
    <Suspense fallback={<AnimatedFallback onVisible={markFallbackVisible}>{fallback}</AnimatedFallback>}>
      <ViewTransition default="none" enter={reveal === 0 ? 'none' : 'auto'} key={reveal}>
        {children}
      </ViewTransition>
    </Suspense>
  );
}

function AnimatedFallback({ children, onVisible }: { children: ReactNode; onVisible: () => void }) {
  useLayoutEffect(() => {
    onVisible();
  }, [onVisible]);

  return (
    <ViewTransition default="none" exit="auto">
      {children}
    </ViewTransition>
  );
}
