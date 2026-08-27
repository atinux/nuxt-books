import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<'input'>, 'max' | 'min' | 'onChange' | 'step' | 'type' | 'value'> & {
  onValueChange: (value: number) => void;
  label: string;
  value: number;
  values: readonly [number, ...number[]];
  readout?: ReactNode;
  hint?: ReactNode;
};

export function Range({ className, hint, id, label, onValueChange, readout, value, values, ...props }: Props) {
  const selectedIndex = values.reduce(
    (closest, option, index) => (Math.abs(option - value) < Math.abs(values[closest] - value) ? index : closest),
    0,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-muted text-xs font-semibold tracking-wide uppercase" htmlFor={id}>
          {label}
        </label>
        <span className="text-sm font-medium text-black tabular-nums dark:text-white">{readout ?? value}</span>
      </div>
      <input
        className={cn(
          'focus-visible:ring-accent/30 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
        id={id}
        max={values.length - 1}
        min={0}
        onChange={event => onValueChange(values[Number(event.currentTarget.value)])}
        step={1}
        type="range"
        value={selectedIndex}
        {...props}
      />
      {hint ? <div className="text-muted flex justify-between text-[11px] tabular-nums">{hint}</div> : null}
    </div>
  );
}
