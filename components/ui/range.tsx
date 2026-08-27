import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<'input'>, 'type'> & {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
};

export function Range({ className, hint, id, label, value, ...props }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-muted text-xs font-semibold tracking-wide uppercase" htmlFor={id}>
          {label}
        </label>
        <span className="text-sm font-medium text-black tabular-nums dark:text-white">{value}</span>
      </div>
      <input
        className={cn(
          'accent-action focus-visible:ring-accent/30 w-full cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
        id={id}
        type="range"
        {...props}
      />
      {hint ? <div className="text-muted flex justify-between text-[11px] tabular-nums">{hint}</div> : null}
    </div>
  );
}
