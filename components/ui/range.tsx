import { cn } from '@/lib/utils';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';

type Props = Omit<ComponentProps<'input'>, 'type' | 'value'> & {
  label: string;
  value: number | string;
  hint?: ReactNode;
};

export function Range({ className, hint, id, label, max, min, value, ...props }: Props) {
  // Webkit has no filled-track pseudo-element, so the fill is a gradient stop that
  // the track rules in globals.css read off this variable.
  const lower = Number(min ?? 0);
  const upper = Number(max ?? 100);
  const span = upper - lower;
  const fill = span > 0 ? Math.min(100, Math.max(0, ((Number(value) - lower) / span) * 100)) : 0;

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
          'focus-visible:ring-accent/30 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
        id={id}
        max={max}
        min={min}
        style={{ '--range-fill': `${fill}%` } as CSSProperties}
        type="range"
        value={value}
        {...props}
      />
      {hint ? <div className="text-muted flex justify-between text-[11px] tabular-nums">{hint}</div> : null}
    </div>
  );
}
