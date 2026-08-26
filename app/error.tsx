'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[65svh] place-items-center px-6 text-center">
      <div>
        <span className="bg-destructive/10 text-destructive mx-auto grid size-12 place-items-center rounded-2xl">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="font-serif mt-5 text-3xl">We lost that page.</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
          The catalog hit an unexpected problem. Your filters are still here,
          so it is safe to try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground mx-auto mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    </main>
  );
}
