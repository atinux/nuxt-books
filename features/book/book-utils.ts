import { LANGUAGES } from '@/features/book/book-constants';

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

// Which of the curated lists, if any, the current `isbn` filter represents.
export function getActiveList(isbn: string | undefined, lists: { name: string; isbns: string }[]) {
  if (!isbn) return undefined;
  const first = isbn.split(',')[0];
  return lists.find(list => list.isbns.split(',')[0] === first)?.name;
}
