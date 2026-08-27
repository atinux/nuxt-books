'use client';

import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

// On a soft navigation a preserved DOM value can outlive the URL it was typed against.
export function useSyncSearchParamToInput(ref: RefObject<HTMLInputElement | null>, param: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.value = new URLSearchParams(window.location.search).get(param) ?? '';
  }, [param, ref]);
}
