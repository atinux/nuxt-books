'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <AlertTriangle aria-hidden className="text-danger size-6" />
        <p className="text-sm font-medium text-black dark:text-white">Something went wrong</p>
        <p className="text-muted text-sm leading-6">
          We couldn&apos;t load the catalog. If this is a fresh clone, run{' '}
          <code className="bg-card dark:bg-card-dark rounded px-1.5 py-0.5 font-mono text-xs">pnpm db:setup</code> to
          create and seed the schema.
        </p>
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  );
}
