import { ITEMS_PER_PAGE } from '@/features/book/book-constants';
import type { Route } from 'next';

export type SearchParams = {
  language?: string;
  list?: string;
  page?: string;
  pages?: string;
  rating?: string;
  search?: string;
  year?: string;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ['search', 'year', 'rating', 'pages', 'language', 'list'] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParams(params: RawSearchParams): SearchParams {
  return {
    language: first(params.language),
    list: first(params.list),
    page: first(params.page),
    pages: first(params.pages),
    rating: first(params.rating),
    search: first(params.search),
    year: first(params.year),
  };
}

export function stringifySearchParams(params: SearchParams): string {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') urlParams.append(key, value);
  }
  return urlParams.toString();
}

export function buildHref(params: SearchParams): Route {
  const query = stringifySearchParams(params);
  return (query ? `/?${query}` : '/') as Route;
}

export function getTotalPages(total: number): number {
  return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
}

export function getCurrentPage(params: SearchParams, totalPages?: number): number {
  const raw = Number(params.page);
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;
  return totalPages ? Math.min(page, totalPages) : page;
}

// Drops `page`: a filter that shrinks the result set would strand you on a dead page.
export function withFilters(current: SearchParams, patch: Partial<SearchParams>): SearchParams {
  const next: SearchParams = { ...current, ...patch };
  delete next.page;
  for (const key of FILTER_KEYS) {
    if (next[key] === undefined || next[key] === '') delete next[key];
  }
  return next;
}

export function withPage(current: SearchParams, page: number): SearchParams {
  const next: SearchParams = { ...current };
  if (page <= 1) delete next.page;
  else next.page = String(page);
  return next;
}
