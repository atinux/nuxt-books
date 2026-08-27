'use client';

import { cloneElement } from 'react';
import { useFormStatus } from 'react-dom';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

type Variant = 'ghost' | 'primary' | 'secondary';
type Size = 'default' | 'icon' | 'sm';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  render?: ReactElement<{ className?: string; children?: ReactNode }>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'focus-visible:ring-action/40 inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const sizes: Record<Size, string> = {
  default: 'h-9 px-4 text-sm',
  icon: 'size-9',
  sm: 'h-8 px-3 text-xs',
};

const variants: Record<Variant, string> = {
  ghost: 'text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white',
  primary: 'bg-action text-white hover:bg-action-hover',
  secondary:
    'border-divider hover:border-gray/40 hover:bg-card dark:border-divider-dark dark:hover:border-gray/30 dark:hover:bg-card-dark border bg-white text-black dark:bg-transparent dark:text-white',
};

export function buttonClasses({
  className,
  size = 'default',
  variant = 'primary',
}: { className?: string; size?: Size; variant?: Variant } = {}) {
  return cn(base, sizes[size], variants[variant], className);
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className,
  render,
  type = 'button',
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const isSubmit = type === 'submit';
  const isDisabled = disabled || (isSubmit && pending);
  const classes = buttonClasses({ className, size, variant });
  const content = (
    <>
      {isSubmit && pending && <Spinner />}
      {children}
    </>
  );

  if (render) {
    return cloneElement(render, { className: cn(classes, render.props?.className), ...props }, content);
  }

  return (
    <button className={classes} disabled={isDisabled} type={type} {...props}>
      {content}
    </button>
  );
}
