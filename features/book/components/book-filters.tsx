'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Range } from '@/components/ui/range';
import { Select } from '@/components/ui/select';
import {
  LANGUAGES,
  LISTS,
  MAX_PAGES,
  MAX_RATING,
  MAX_YEAR,
  MIN_PAGES,
  MIN_RATING,
  MIN_YEAR,
  PAGES_STEP,
  RATING_STEP,
  YEAR_STEP,
} from '@/features/book/book-constants';
import { getActiveList } from '@/features/book/book-utils';
import { buildHref, parseSearchParams, withFilters } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

function FiltersBase({ initialParams }: { initialParams: SearchParams }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useOptimistic(initialParams);

  const activeCount = Object.values(filters).filter(Boolean).length;
  const activeList = getActiveList(filters.isbn, LISTS);

  // `useOptimistic` reverts when its transition settles, so the navigation has to
  // ride along inside the same transition.
  function commit(patch: Partial<SearchParams>) {
    const next = withFilters(filters, patch);
    startTransition(() => {
      setFilters(next);
      router.replace(buildHref(next), { scroll: false });
    });
  }

  function toggleList(isbns: string) {
    const listIsbns = isbns.split(',');
    const current = filters.isbn?.split(',') ?? [];
    const isActive = current.includes(listIsbns[0]);
    commit({ isbn: isActive ? undefined : isbns });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-filtering={isPending ? '' : undefined}>
      <div className="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain px-1 pb-6">
        <div className="flex flex-col gap-6">
          <Range
            hint={
              <>
                <span>{MIN_YEAR}</span>
                <span>{MAX_YEAR}</span>
              </>
            }
            id="filter-year"
            label="Published before"
            max={MAX_YEAR}
            min={MIN_YEAR}
            onChange={event => commit({ yr: event.target.value })}
            step={YEAR_STEP}
            value={filters.yr ?? String(MAX_YEAR)}
          />

          <Range
            hint={
              <>
                <span>Any</span>
                <span>{MAX_RATING} stars</span>
              </>
            }
            id="filter-rating"
            label="Minimum rating"
            max={MAX_RATING}
            min={MIN_RATING}
            onChange={event => commit({ rtg: event.target.value })}
            step={RATING_STEP}
            value={filters.rtg ?? String(MIN_RATING)}
          />

          <Range
            hint={
              <>
                <span>{MIN_PAGES}</span>
                <span>{MAX_PAGES.toLocaleString()}</span>
              </>
            }
            id="filter-pages"
            label="Max pages"
            max={MAX_PAGES}
            min={MIN_PAGES}
            onChange={event => commit({ pgs: event.target.value })}
            step={PAGES_STEP}
            value={filters.pgs ?? String(MAX_PAGES)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-muted text-xs font-semibold tracking-wide uppercase" htmlFor="filter-language">
              Language
            </label>
            <Select
              id="filter-language"
              onChange={event => commit({ lng: event.target.value })}
              value={filters.lng ?? 'en'}
            >
              {LANGUAGES.map(language => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </Select>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Book lists</legend>
            {LISTS.map(list => (
              <label
                className="hover:bg-card dark:hover:bg-card-dark -mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors"
                key={list.name}
              >
                <Input
                  checked={activeList === list.name}
                  onChange={() => toggleList(list.isbns)}
                  type="checkbox"
                  variant="checkbox"
                />
                {list.name}
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      {activeCount > 0 ? (
        <div className="border-divider dark:border-divider-dark border-t pt-3">
          <Button
            className="w-full"
            onClick={() =>
              startTransition(() => {
                setFilters({});
                router.replace('/', { scroll: false });
              })
            }
            variant="secondary"
          >
            Clear all filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function BookFiltersFallback() {
  return <FiltersBase initialParams={{}} />;
}

export function BookFilters() {
  const searchParams = useSearchParams();
  return <FiltersBase initialParams={parseSearchParams(Object.fromEntries(searchParams))} />;
}
