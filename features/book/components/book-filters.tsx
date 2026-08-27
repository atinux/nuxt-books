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
  PAGE_FILTER_VALUES,
  RATING_FILTER_VALUES,
  YEAR_FILTER_VALUES,
} from '@/features/book/book-constants';
import { buildHref, parseSearchParams, withFilters } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

type FilterAction = { patch: Partial<SearchParams>; type: 'change' } | { type: 'reset' };

function filterReducer(filters: SearchParams, action: FilterAction): SearchParams {
  return action.type === 'reset' ? {} : withFilters(filters, action.patch);
}

function BookFiltersForm({ idPrefix, initialParams }: { idPrefix: string; initialParams: SearchParams }) {
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
      <div className="min-h-0 flex-1 touch-pan-y [scrollbar-gutter:stable] overflow-x-hidden overflow-y-auto overscroll-contain px-1 pb-6">
        <div className="flex flex-col gap-6">
          <Range
            hint={
              <>
                <span>{MIN_YEAR}</span>
                <span>{MAX_YEAR}</span>
              </>
            }
            id={`${idPrefix}-filter-year`}
            label="Published before"
            onValueChange={value => commit({ year: value === MAX_YEAR ? undefined : String(value) })}
            readout={filters.year ? filters.year : 'Any year'}
            value={Number(filters.year ?? MAX_YEAR)}
            values={YEAR_FILTER_VALUES}
          />

          <Range
            hint={
              <>
                <span>Any</span>
                <span>{MAX_RATING} stars</span>
              </>
            }
            id={`${idPrefix}-filter-rating`}
            label="Minimum rating"
            onValueChange={value => commit({ rating: value === MIN_RATING ? undefined : String(value) })}
            readout={Number(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any rating'}
            value={Number(filters.rating ?? MIN_RATING)}
            values={RATING_FILTER_VALUES}
          />

          <Range
            hint={
              <>
                <span>{MIN_PAGES}</span>
                <span>{MAX_PAGES.toLocaleString()}</span>
              </>
            }
            id={`${idPrefix}-filter-pages`}
            label="Max pages"
            onValueChange={value => commit({ pages: value === MAX_PAGES ? undefined : String(value) })}
            readout={filters.pages ? `${Number(filters.pages).toLocaleString()} pages` : 'Any length'}
            value={Number(filters.pages ?? MAX_PAGES)}
            values={PAGE_FILTER_VALUES}
          />

          <div className="flex flex-col gap-2">
            <label
              className="text-muted text-xs font-semibold tracking-wide uppercase"
              htmlFor={`${idPrefix}-filter-language`}
            >
              Language
            </label>
            <Select
              id={`${idPrefix}-filter-language`}
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

export function BookFiltersFallback({ idPrefix }: { idPrefix: string }) {
  return <BookFiltersForm idPrefix={idPrefix} initialParams={{}} />;
}

export function BookFilters({ idPrefix }: { idPrefix: string }) {
  const searchParams = useSearchParams();
  return <BookFiltersForm idPrefix={idPrefix} initialParams={parseSearchParams(Object.fromEntries(searchParams))} />;
}
