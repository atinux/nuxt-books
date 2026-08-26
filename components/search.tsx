"use client";

import { LoaderCircle, SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

function SearchBase({
  initialQuery = "",
  initialParams = "",
}: {
  initialQuery?: string;
  initialParams?: string;
}) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const navigate = (value: string) => {
    const params = new URLSearchParams(initialParams);
    const query = value.trim();

    if (query) params.set("search", query);
    else params.delete("search");
    params.delete("page");

    startTransition(() => {
      router.replace(params.size ? `/?${params}` : "/", { scroll: false });
    });
  };

  const queueNavigation = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(value), 220);
  };

  return (
    <form
      className="relative min-w-0 flex-1"
      onSubmit={(event) => {
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate(inputRef.current?.value ?? "");
      }}
    >
      <label htmlFor="search" className="sr-only">
        Search by title or author
      </label>
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
      <input
        key={initialQuery}
        ref={inputRef}
        id="search"
        name="search"
        type="search"
        defaultValue={initialQuery}
        onChange={(event) => queueNavigation(event.currentTarget.value)}
        placeholder="Search by title or author…"
        autoComplete="off"
        className="border-border bg-card/90 placeholder:text-muted-foreground h-11 w-full rounded-xl border pr-20 pl-11 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
      />
      <span className="absolute top-1/2 right-4 -translate-y-1/2">
        {isPending ? (
          <LoaderCircle className="text-primary size-4 animate-spin" />
        ) : initialQuery ? (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              navigate("");
            }}
            className="text-muted-foreground hover:text-foreground grid size-6 place-items-center rounded-full"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="text-muted-foreground hidden rounded border px-1.5 py-0.5 font-sans text-[10px] sm:inline">
            /
          </kbd>
        )}
      </span>
    </form>
  );
}

export function SearchFallback() {
  return <SearchBase />;
}

export function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") ?? "";
  return (
    <SearchBase initialQuery={query} initialParams={searchParams.toString()} />
  );
}
