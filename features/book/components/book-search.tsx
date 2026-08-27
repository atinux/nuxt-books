'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { SeedFromSearchParam } from '@/components/scripts/seed-from-search-param';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useSyncSearchParamToInput } from '@/hooks/use-sync-search-param-to-input';
import { buildHref, parseSearchParams, withFilters } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

const DEBOUNCE_MS = 220;

function SearchBase({ initialParams }: { initialParams: SearchParams }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  useSyncSearchParamToInput(inputRef, 'search');
  useEffect(() => setIsHydrated(true), []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function navigate(value: string) {
    const query = value.trim();
    startTransition(() => {
      router.replace(buildHref(withFilters(initialParams, { search: query || undefined })), { scroll: false });
    });
  }

  return (
    <form
      className="relative flex-1"
      data-filtering={isPending ? '' : undefined}
      data-search-ready={isHydrated ? '' : undefined}
      onSubmit={event => {
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate(inputRef.current?.value ?? '');
      }}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search books
      </label>
      <SearchIcon
        aria-hidden
        className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
      />
      <Input
        defaultValue={initialParams.search ?? ''}
        id={inputId}
        name="search"
        onChange={event => {
          const { value } = event.target;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => navigate(value), DEBOUNCE_MS);
        }}
        placeholder="Search books…"
        ref={inputRef}
        suppressHydrationWarning
        type="search"
        variant="search"
      />
      <SeedFromSearchParam param="search" targetId={inputId} />
      {isPending ? (
        <span aria-hidden className="absolute top-1/2 right-3.5 -translate-y-1/2">
          <Spinner className="text-muted size-4" />
        </span>
      ) : null}
    </form>
  );
}

export function BookSearchFallback() {
  return <SearchBase initialParams={{}} />;
}

export function BookSearch() {
  const searchParams = useSearchParams();
  return <SearchBase initialParams={parseSearchParams(Object.fromEntries(searchParams))} />;
}
