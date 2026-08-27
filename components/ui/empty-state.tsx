import { BookMark } from '@/components/book-mark';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  body?: string;
  children?: ReactNode;
};

export function EmptyState({ body, children, title }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
      <BookMark className="text-divider dark:text-divider-dark size-9" />
      <p className="text-sm font-medium text-black dark:text-white">{title}</p>
      {body ? <p className="text-muted max-w-xs text-sm leading-6">{body}</p> : null}
      {children}
    </div>
  );
}
