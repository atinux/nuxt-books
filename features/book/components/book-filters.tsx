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
import { buildHref, parseSearchParams, withFilters } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

type FilterAction = { patch: Partial<SearchParams>; type: 'change' } | { type: 'reset' };

function filterReducer(filters: SearchParams, action: FilterAction): SearchParams {
  return action.type === 'reset' ? {} : withFilters(filters, action.patch);
}

function BookFiltersForm({ initialParams }: { initialParams: SearchParams }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, dispatch] = useOptimistic(initialParams, filterReducer);

  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'page' && Boolean(value)).length;

  function commit(patch: Partial<SearchParams>) {
    const next = withFilters(filters, patch);
    startTransition(() => {
      dispatch({ patch, type: 'change' });
      router.replace(buildHref(next), { scroll: false });
    });
  }

  function toggleList(slug: string) {
    commit({ list: filters.list === slug ? undefined : slug });
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
            onChange={event => commit({ year: event.target.value })}
            readout={filters.year ? filters.year : 'Any year'}
            step={YEAR_STEP}
            value={filters.year ?? String(MAX_YEAR)}
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
            onChange={event => commit({ rating: event.target.value })}
            readout={Number(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any rating'}
            step={RATING_STEP}
            value={filters.rating ?? String(MIN_RATING)}
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
            onChange={event => commit({ pages: event.target.value })}
            readout={filters.pages ? `${Number(filters.pages).toLocaleString()} pages` : 'Any length'}
            step={PAGES_STEP}
            value={filters.pages ?? String(MAX_PAGES)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-muted text-xs font-semibold tracking-wide uppercase" htmlFor="filter-language">
              Language
            </label>
            <Select
              id="filter-language"
              onChange={event => commit({ language: event.target.value })}
              value={filters.language ?? 'en'}
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
                  checked={filters.list === list.slug}
                  onChange={() => toggleList(list.slug)}
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
                dispatch({ type: 'reset' });
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
  return <BookFiltersForm initialParams={{}} />;
}

export function BookFilters() {
  const searchParams = useSearchParams();
  return <BookFiltersForm initialParams={parseSearchParams(Object.fromEntries(searchParams))} />;
}
