import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number, enabled = true) {
  return enabled ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}
