import 'server-only';

import { cacheLife } from 'next/cache';
import { and, count, eq, gte, isNull, lte, not, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { authors, books, bookToAuthor } from '@/lib/db/schema';
import { EMPTY_IMAGE_URL, ITEMS_PER_PAGE, MAX_PAGES, MAX_YEAR, MIN_YEAR } from '@/features/book/book-constants';
import type { SearchParams } from '@/lib/url-state';

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

export type BooksPage = {
  books: BookSummary[];
  total: number;
};

const previewBooks: BookDetails[] = [
  {
    id: 5333265,
    title: 'W.C. Fields: A Life on Film',
    image_url: 'https://images.gr-assets.com/books/1310220028m/5333265.jpg',
    thumbhash: null,
    publication_year: 1984,
    average_rating: '4.00',
    isbn: '0312853122',
    publisher: "St. Martin's Press",
    description: 'A portrait of the legendary performer and the life behind his unmistakable screen persona.',
    num_pages: 256,
    language_code: 'eng',
    ratings_count: 3,
    authors: ['Ronald J. Fields'],
  },
  {
    id: 1333909,
    title: 'Good Harbor',
    image_url: EMPTY_IMAGE_URL,
    thumbhash: null,
    publication_year: 2001,
    average_rating: '3.23',
    isbn: '0743509986',
    publisher: 'Simon & Schuster Audio',
    description:
      'A story about the strength and necessity of adult friendship, set against the rocky coast of Gloucester, Massachusetts.',
    num_pages: null,
    language_code: 'eng',
    ratings_count: 10,
    authors: ['Anita Diamant'],
  },
  {
    id: 7327624,
    title: 'The Unschooled Wizard',
    image_url: 'https://images.gr-assets.com/books/1304100136m/7327624.jpg',
    thumbhash: null,
    publication_year: 1987,
    average_rating: '4.03',
    isbn: null,
    publisher: 'Nelson Doubleday, Inc.',
    description: 'An omnibus edition containing The Ladies of Mandrigyn and The Witches of Wenshar.',
    num_pages: 600,
    language_code: 'eng',
    ratings_count: 140,
    authors: ['Barbara Hambly'],
  },
  {
    id: 6066819,
    title: 'Best Friends Forever',
    image_url: EMPTY_IMAGE_URL,
    thumbhash: null,
    publication_year: 2009,
    average_rating: '3.49',
    isbn: '0743294297',
    publisher: 'Atria Books',
    description: 'Two childhood friends reunite twenty-five years later and begin an unexpected adventure together.',
    num_pages: 368,
    language_code: 'eng',
    ratings_count: 89_000,
    authors: ['Jennifer Weiner'],
  },
];

const yearFilter = (year?: string) => {
  const maxYear = year ? Math.max(MIN_YEAR, Math.min(MAX_YEAR, Number(year))) : MAX_YEAR;
  return and(gte(books.publication_year, MIN_YEAR), lte(books.publication_year, maxYear));
};

const ratingFilter = (rating?: string) => (rating ? sql`${books.average_rating} >= ${Number(rating)}` : undefined);

const languageFilter = (language?: string) => {
  if (language === 'en') {
    return sql`${books.language_code} IN ('eng', 'en-US', 'en-GB')`;
  }
  return language ? eq(books.language_code, language) : undefined;
};

const pageFilter = (pages?: string) => lte(books.num_pages, pages ? Math.min(MAX_PAGES, Number(pages)) : MAX_PAGES);

const imageFilter = () => and(not(isNull(books.image_url)), sql`${books.image_url} != ${EMPTY_IMAGE_URL}`);

const searchFilter = (query?: string) =>
  query?.trim()
    ? sql`to_tsvector('english', ${books.title_tsv}) @@ plainto_tsquery('english', unaccent(${query.trim()}))`
    : undefined;

const isbnFilter = (isbn?: string) => {
  if (!isbn) return undefined;
  const values = isbn.split(',').map(value => value.trim());
  return sql`${books.isbn} IN (${sql.join(
    values.map(value => sql`${value}`),
    sql`, `,
  )})`;
};

function getWhereClause(searchParams: SearchParams) {
  const filters = [
    yearFilter(searchParams.yr),
    ratingFilter(searchParams.rtg),
    languageFilter(searchParams.lng),
    pageFilter(searchParams.pgs),
    imageFilter(),
    searchFilter(searchParams.search),
    isbnFilter(searchParams.isbn),
  ].filter(filter => filter !== undefined);

  return filters.length ? and(...filters) : undefined;
}

function getPreviewBooks(searchParams: SearchParams): BooksPage {
  const query = searchParams.search?.trim().toLocaleLowerCase();
  const isbns = searchParams.isbn?.split(',');
  const maxYear = searchParams.yr ? Number(searchParams.yr) : MAX_YEAR;
  const minRating = searchParams.rtg ? Number(searchParams.rtg) : 0;
  const maxPages = searchParams.pgs ? Number(searchParams.pgs) : MAX_PAGES;

  const filtered = previewBooks.filter(book => {
    const matchesQuery = !query || book.title.toLocaleLowerCase().includes(query);
    const matchesLanguage =
      !searchParams.lng ||
      (searchParams.lng === 'en'
        ? ['eng', 'en-US', 'en-GB'].includes(book.language_code ?? '')
        : book.language_code === searchParams.lng);

    return (
      matchesQuery &&
      matchesLanguage &&
      book.image_url !== EMPTY_IMAGE_URL &&
      (!isbns || (!!book.isbn && isbns.includes(book.isbn))) &&
      (book.publication_year ?? 0) >= MIN_YEAR &&
      (book.publication_year ?? Infinity) <= maxYear &&
      Number(book.average_rating ?? 0) >= minRating &&
      (book.num_pages ?? 0) <= maxPages
    );
  });

  const page = Math.max(1, Number(searchParams.page) || 1);
  const start = (page - 1) * ITEMS_PER_PAGE;

  return {
    books: filtered.slice(start, start + ITEMS_PER_PAGE),
    total: filtered.length,
  };
}

export async function getBooksPage(searchParams: SearchParams): Promise<BooksPage> {
  'use cache';
  cacheLife('hours');

  const database = db;
  if (!database) return getPreviewBooks(searchParams);

  const whereClause = getWhereClause(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const [result, [{ total }]] = await Promise.all([
    database
      .select({
        id: books.id,
        title: books.title,
        image_url: books.image_url,
        thumbhash: books.thumbhash,
      })
      .from(books)
      .where(whereClause)
      .orderBy(books.id)
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
    database.select({ total: count() }).from(books).where(whereClause),
  ]);

  return {
    books: result,
    total,
  };
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
      id: books.id,
      isbn: books.isbn,
      title: books.title,
      publication_year: books.publication_year,
      publisher: books.publisher,
      image_url: books.image_url,
      description: books.description,
      num_pages: books.num_pages,
      language_code: books.language_code,
      ratings_count: books.ratings_count,
      average_rating: books.average_rating,
      authors: sql<string[]>`array_remove(array_agg(${authors.name}), NULL)`,
      thumbhash: books.thumbhash,
    })
    .from(books)
    .leftJoin(bookToAuthor, eq(books.id, bookToAuthor.bookId))
    .leftJoin(authors, eq(bookToAuthor.authorId, authors.id))
    .where(eq(books.id, bookId))
    .groupBy(books.id)
    .limit(1);

  return result[0];
}
