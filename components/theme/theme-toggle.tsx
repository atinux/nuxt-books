'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const subscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ variant = 'pill' }: { variant?: 'inline' | 'pill' }) {
  const { setTheme, theme } = useTheme();
  const mounted = useIsMounted();
  const active = mounted ? theme : undefined;

  return (
    <div
      className={
        variant === 'inline'
          ? 'inline-flex items-center gap-0.5'
          : 'border-divider dark:border-divider-dark inline-flex items-center rounded-full border p-0.5'
      }
    >
      <ToggleButton active={active === 'light'} label="Light mode" onClick={() => setTheme('light')}>
        <Sun className="size-4" />
      </ToggleButton>
      <ToggleButton active={active === 'dark'} label="Dark mode" onClick={() => setTheme('dark')}>
        <Moon className="size-4" />
      </ToggleButton>
      <ToggleButton active={active === 'system'} label="System theme" onClick={() => setTheme('system')}>
        <Monitor className="size-4" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-full p-1.5 transition-colors',
        active
          ? 'bg-card dark:bg-card-dark text-black dark:text-white'
          : 'text-muted hover:text-black dark:hover:text-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
