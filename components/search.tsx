'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

function SearchBase({
  initialQuery,
  initialParams = '',
}: {
  initialQuery: string;
  initialParams?: string;
}) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(value: string) {
    const params = new URLSearchParams(initialParams);
    const query = value.trim();

    if (query) params.set('search', query);
    else params.delete('search');
    params.delete('page');

    startTransition(() => {
      router.replace(params.size ? `/?${params}` : '/', { scroll: false });
    });
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(value), 220);
  }

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <form
      className="relative flex flex-1 flex-shrink-0 w-full rounded shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate(inputValue);
      }}
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        onChange={handleInputChange}
        type="text"
        name="search"
        id="search"
        placeholder="Search books..."
        value={inputValue}
        className="w-full border-0 px-10 py-6 text-base md:text-sm overflow-hidden focus-visible:ring-0"
      />
      <LoadingSpinner pending={isPending} />
    </form>
  );
}

function LoadingSpinner({ pending }: { pending: boolean }) {
  return (
    <div
      data-pending={pending ? '' : undefined}
      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-300"
    >
      <svg className="h-5 w-5" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray="282.7"
          strokeDashoffset="282.7"
          className={pending ? 'animate-fill-clock' : ''}
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  );
}

export function SearchFallback() {
  return <SearchBase initialQuery="" />;
}

export function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get('search') ?? '';
  return (
    <SearchBase initialQuery={query} initialParams={searchParams.toString()} />
  );
}
