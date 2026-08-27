import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Size = 'default' | 'sm';

type Props = {
  children: ReactNode;
  label: string;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'text-muted hover:bg-card focus-visible:ring-accent/40 dark:hover:bg-card-dark inline-flex shrink-0 items-center justify-center rounded-md transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-white';

const sizes: Record<Size, string> = {
  default: 'size-8',
  sm: 'size-7',
};

export function IconButton({ children, className, label, size = 'default', type = 'button', ...props }: Props) {
  return (
    <button aria-label={label} className={cn(base, sizes[size], className)} type={type} {...props}>
      {children}
    </button>
  );
}
