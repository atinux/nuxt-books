import {
  LANGUAGES,
  LISTS,
  MAX_PAGES,
  MAX_RATING,
  MAX_YEAR,
  MIN_PAGES,
  MIN_RATING,
  MIN_YEAR,
} from '@/features/book/book-constants';
import type { SearchParams } from '@/lib/url-state';

export function getLanguageLabel(code: string | null): string {
  if (!code) return 'Unknown';
  const normalized = code.toLowerCase();
  const language = LANGUAGES.find(
    lang => lang.value === normalized || (lang.value === 'en' && ['en-gb', 'en-us', 'eng'].includes(normalized)),
  );
  return language ? language.label : 'Unknown';
}

export function formatCount(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 10_000) return `${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000) return `${Math.floor(n / 1000)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function toBookQuery(params: SearchParams) {
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
