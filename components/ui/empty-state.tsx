import { BookMark } from '@/components/book-mark';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  body?: string;
  children?: ReactNode;
};

export function EmptyState({ body, children, title }: Props) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <BookMark animated className="mb-1 size-10" />
        <p className="text-sm font-medium">{title}</p>
        {body ? <p className="text-muted text-sm leading-6">{body}</p> : null}
        {children}
      </div>
    </div>
  );
}
