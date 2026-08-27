import 'server-only';

import { and, count, eq, gte, isNull, lte, not, sql } from 'drizzle-orm';
import { cacheLife } from 'next/cache';
import {
  EMPTY_IMAGE_URL,
  ITEMS_PER_PAGE,
  MAX_PAGES,
  MAX_YEAR,
  MIN_RATING,
  MIN_YEAR,
} from '@/features/book/book-constants';
import { GENERATED_PREVIEW_BOOKS } from '@/features/book/book-preview-catalog';
import { db } from '@/lib/db/drizzle';
import { authors, books, bookToAuthor } from '@/lib/db/schema';

export type BookSummary = {
  id: number;
  title: string;
  image_url: string | null;
  thumbhash: string | null;
};

export type BookDetails = BookSummary & {
  isbn: string | null;
  publisher: string | null;
  description: string | null;
  num_pages: number | null;
  language_code: string | null;
  ratings_count: number | null;
  publication_year: number | null;
  average_rating: string | null;
  authors: string[];
};

const sampleBooks: BookDetails[] = [
  {
    authors: ['Ronald J. Fields'],
    average_rating: '4.00',
    description: 'A portrait of the legendary performer and the life behind his unmistakable screen persona.',
    id: 5333265,
    image_url: 'https://images.gr-assets.com/books/1310220028m/5333265.jpg',
    isbn: '0312853122',
    language_code: 'eng',
    num_pages: 256,
    publication_year: 1984,
    publisher: "St. Martin's Press",
    ratings_count: 3,
    thumbhash: null,
    title: 'W.C. Fields: A Life on Film',
  },
  {
    authors: ['Anita Diamant'],
    average_rating: '3.23',
    description:
      'A story about the strength and necessity of adult friendship, set against the rocky coast of Gloucester, Massachusetts.',
    id: 1333909,
    image_url: EMPTY_IMAGE_URL,
    isbn: '0743509986',
    language_code: 'eng',
    num_pages: null,
    publication_year: 2001,
    publisher: 'Simon & Schuster Audio',
    ratings_count: 10,
    thumbhash: null,
    title: 'Good Harbor',
  },
  {
    authors: ['Barbara Hambly'],
    average_rating: '4.03',
    description: 'An omnibus edition containing The Ladies of Mandrigyn and The Witches of Wenshar.',
    id: 7327624,
    image_url: 'https://images.gr-assets.com/books/1304100136m/7327624.jpg',
    isbn: null,
    language_code: 'eng',
    num_pages: 600,
    publication_year: 1987,
    publisher: 'Nelson Doubleday, Inc.',
    ratings_count: 140,
    thumbhash: null,
    title: 'The Unschooled Wizard',
  },
  {
    authors: ['Jennifer Weiner'],
    average_rating: '3.49',
    description: 'Two childhood friends reunite twenty-five years later and begin an unexpected adventure together.',
    id: 6066819,
    image_url: EMPTY_IMAGE_URL,
    isbn: '0743294297',
    language_code: 'eng',
    num_pages: 368,
    publication_year: 2009,
    publisher: 'Atria Books',
    ratings_count: 89_000,
    thumbhash: null,
    title: 'Best Friends Forever',
  },
];

const previewBooks: BookDetails[] = [...sampleBooks, ...GENERATED_PREVIEW_BOOKS];

const yearFilter = (year: number) => and(gte(books.publication_year, MIN_YEAR), lte(books.publication_year, year));

const ratingFilter = (rating: number) => (rating > MIN_RATING ? sql`${books.average_rating} >= ${rating}` : undefined);

const languageFilter = (language: string) => {
  if (!language) return undefined;
  if (language === 'en') return sql`${books.language_code} IN ('eng', 'en-US', 'en-GB')`;
  return eq(books.language_code, language);
};

const pageCountFilter = (maxPages: number) => lte(books.num_pages, maxPages);

const imageFilter = () => and(not(isNull(books.image_url)), sql`${books.image_url} != ${EMPTY_IMAGE_URL}`);

const searchFilter = (search: string) =>
  search
    ? sql`to_tsvector('english', ${books.title_tsv}) @@ plainto_tsquery('english', unaccent(${search}))`
    : undefined;

const isbnFilter = (isbns: string) => {
  if (!isbns) return undefined;
  const values = isbns.split(',').map(value => value.trim());
  return sql`${books.isbn} IN (${sql.join(
    values.map(value => sql`${value}`),
    sql`, `,
  )})`;
};

function getWhereClause(
  search: string,
  year: number,
  rating: number,
  language: string,
  maxPages: number,
  isbns: string,
) {
  const filters = [
    yearFilter(year),
    ratingFilter(rating),
    languageFilter(language),
    pageCountFilter(maxPages),
    imageFilter(),
    searchFilter(search),
    isbnFilter(isbns),
  ].filter(filter => filter !== undefined);

  return filters.length ? and(...filters) : undefined;
}

function filterPreview(
  search: string,
  year: number,
  rating: number,
  language: string,
  maxPages: number,
  isbns: string,
): BookDetails[] {
  const query = search.toLocaleLowerCase();
  const isbnList = isbns ? isbns.split(',') : undefined;

  return previewBooks.filter(book => {
    const matchesQuery = !query || book.title.toLocaleLowerCase().includes(query);
    const matchesLanguage =
      !language ||
      (language === 'en'
        ? ['eng', 'en-US', 'en-GB'].includes(book.language_code ?? '')
        : book.language_code === language);

    return (
      matchesQuery &&
      matchesLanguage &&
      book.image_url !== EMPTY_IMAGE_URL &&
      (!isbnList || (!!book.isbn && isbnList.includes(book.isbn))) &&
      (book.publication_year ?? 0) >= MIN_YEAR &&
      (book.publication_year ?? Infinity) <= year &&
      Number(book.average_rating ?? 0) >= rating &&
      (book.num_pages ?? 0) <= maxPages
    );
  });
}

function getPreviewBooks(
  page: number,
  search: string,
  year: number,
  rating: number,
  language: string,
  maxPages: number,
  isbns: string,
): BookSummary[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return filterPreview(search, year, rating, language, maxPages, isbns).slice(start, start + ITEMS_PER_PAGE);
}

function getPreviewCount(
  search: string,
  year: number,
  rating: number,
  language: string,
  maxPages: number,
  isbns: string,
): number {
  return filterPreview(search, year, rating, language, maxPages, isbns).length;
}

export async function getBooksPage(
  page: number = 1,
  search: string = '',
  year: number = MAX_YEAR,
  rating: number = MIN_RATING,
  language: string = '',
  maxPages: number = MAX_PAGES,
  isbns: string = '',
): Promise<BookSummary[]> {
  'use cache';
  cacheLife('hours');

  const database = db;
  if (!database) return getPreviewBooks(page, search, year, rating, language, maxPages, isbns);

  return database
    .select({
      id: books.id,
      image_url: books.image_url,
      thumbhash: books.thumbhash,
      title: books.title,
    })
    .from(books)
    .where(getWhereClause(search, year, rating, language, maxPages, isbns))
    .orderBy(books.id)
    .limit(ITEMS_PER_PAGE)
    .offset((page - 1) * ITEMS_PER_PAGE);
}

export async function getBooksCount(
  search: string = '',
  year: number = MAX_YEAR,
  rating: number = MIN_RATING,
  language: string = '',
  maxPages: number = MAX_PAGES,
  isbns: string = '',
): Promise<number> {
  'use cache';
  cacheLife('hours');

  const database = db;
  if (!database) return getPreviewCount(search, year, rating, language, maxPages, isbns);

  const [{ total }] = await database
    .select({ total: count() })
    .from(books)
    .where(getWhereClause(search, year, rating, language, maxPages, isbns));
  return total;
}

export async function getBookById(id: string): Promise<BookDetails | undefined> {
  'use cache';
  cacheLife('hours');

  const bookId = Number(id);
  if (!Number.isInteger(bookId)) return undefined;

  const database = db;
  if (!database) return previewBooks.find(book => book.id === bookId);

  const result = await database
    .select({
      authors: sql<string[]>`array_remove(array_agg(${authors.name}), NULL)`,
      average_rating: books.average_rating,
      description: books.description,
      id: books.id,
      image_url: books.image_url,
      isbn: books.isbn,
      language_code: books.language_code,
      num_pages: books.num_pages,
      publication_year: books.publication_year,
      publisher: books.publisher,
      ratings_count: books.ratings_count,
      thumbhash: books.thumbhash,
      title: books.title,
    })
    .from(books)
    .leftJoin(bookToAuthor, eq(books.id, bookToAuthor.bookId))
    .leftJoin(authors, eq(bookToAuthor.authorId, authors.id))
    .where(eq(books.id, bookId))
    .groupBy(books.id)
    .limit(1);

  return result[0];
}
