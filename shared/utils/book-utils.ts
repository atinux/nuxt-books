import { LANGUAGES, LISTS, MAX_PAGES, MAX_RATING, MAX_YEAR, MIN_PAGES, MIN_RATING, MIN_YEAR } from './book-constants';
import type { SearchParams } from './url-state';

export function getLanguageLabel(code: string | null): string {
  if (!code) return 'Unknown';
  const normalized = code.toLowerCase();
  const language = LANGUAGES.find(
    lang => lang.value === normalized || (lang.value === 'en' && ['en-gb', 'en-us', 'eng'].includes(normalized)),
  );
  return language?.label ?? 'Unknown';
}

export function formatCount(value: number): string {
  if (value < 1000) return `${value}`;
  if (value < 10_000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1_000_000) return `${Math.floor(value / 1000)}K`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export type BookFilters = {
  isbns: string;
  language: string;
  maxPages: number;
  rating: number;
  search: string;
  year: number;
};

export type BookQuery = BookFilters & { page: number };

export function toBookFilters({ isbns, language, maxPages, rating, search, year }: BookQuery): BookFilters {
  return { isbns, language, maxPages, rating, search, year };
}

export function toBookQuery(params: SearchParams): BookQuery {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const num = (raw: string | undefined, fallback: number) => {
    const parsed = Number(raw);
    return raw !== undefined && !Number.isNaN(parsed) ? parsed : fallback;
  };

  return {
    isbns: LISTS.find(list => list.slug === params.list)?.isbns ?? '',
    language: params.language ?? '',
    maxPages: clamp(num(params.pages, MAX_PAGES), MIN_PAGES, MAX_PAGES),
    page: Math.max(1, Math.trunc(num(params.page, 1))),
    rating: clamp(num(params.rating, MIN_RATING), MIN_RATING, MAX_RATING),
    search: params.search?.trim() ?? '',
    year: clamp(num(params.year, MAX_YEAR), MIN_YEAR, MAX_YEAR),
  };
}
