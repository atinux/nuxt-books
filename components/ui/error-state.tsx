import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title?: string;
  body?: string;
  compact?: boolean;
  // The retry control: `retry()` from an in-tree boundary, `reset()` from a route error.
  children?: ReactNode;
};

export function ErrorState({ body, children, compact, title }: Props) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
        <AlertTriangle aria-hidden className="text-danger size-4" />
        <p className="text-muted text-xs">{title ?? 'Something went wrong'}</p>
        {body ? <p className="text-muted text-xs leading-5">{body}</p> : null}
        {children}
      </div>
    );
  }

  return (
    <div className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <AlertTriangle aria-hidden className="text-danger size-6" />
        <p className="text-sm font-medium text-black dark:text-white">{title ?? 'Something went wrong'}</p>
        {body ? <p className="text-muted text-sm leading-6">{body}</p> : null}
        {children}
      </div>
    </div>
  );
}
