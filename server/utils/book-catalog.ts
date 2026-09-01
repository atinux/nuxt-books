import { and, count, eq, gte, inArray, isNull, lte, not, sql } from 'drizzle-orm';
import { PREVIEW_BOOKS } from '../data/preview-books';
import { db } from '../lib/db/drizzle';
import { authors, books, bookToAuthor } from '../lib/db/schema';
import { EMPTY_IMAGE_URL, ITEMS_PER_PAGE, MIN_RATING, MIN_YEAR } from '#shared/utils/book-constants';
import type { BookDetails, BookSummary } from '#shared/types/book';
import type { BookFilters, BookQuery } from '#shared/utils/book-utils';

const yearFilter = (year: number) => and(gte(books.publication_year, MIN_YEAR), lte(books.publication_year, year));

const ratingFilter = (rating: number) => (rating > MIN_RATING ? sql`${books.average_rating} >= ${rating}` : undefined);

const languageFilter = (language: string) => {
  if (!language) return undefined;
  if (language === 'en') return sql`${books.language_code} IN ('eng', 'en-US', 'en-GB')`;
  return eq(books.language_code, language);
};

const pageCountFilter = (maxPages: number) => lte(books.num_pages, maxPages);

const imageFilter = () => and(not(isNull(books.image_url)), sql`${books.image_url} != ${EMPTY_IMAGE_URL}`);

const toFtsQuery = (search: string) =>
  search
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `"${term.replaceAll('"', '""')}"`)
    .join(' AND ');

const searchFilter = (search: string) => {
  const query = toFtsQuery(search);
  return query ? sql`${books.id} IN (SELECT rowid FROM books_fts WHERE books_fts MATCH ${query})` : undefined;
};

const isbnFilter = (isbns: string) => {
  if (!isbns) return undefined;
  const values = isbns.split(',').map(value => value.trim());
  return inArray(books.isbn, values);
};

function getWhereClause({ isbns, language, maxPages, rating, search, year }: BookFilters) {
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

function filterPreview({ isbns, language, maxPages, rating, search, year }: BookFilters): BookDetails[] {
  const query = search.toLocaleLowerCase();
  const isbnList = isbns ? isbns.split(',') : undefined;

  return PREVIEW_BOOKS.filter(book => {
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

export async function getBooksPage(query: BookQuery): Promise<BookSummary[]> {
  if (!db) {
    const start = (query.page - 1) * ITEMS_PER_PAGE;
    return filterPreview(query).slice(start, start + ITEMS_PER_PAGE);
  }

  return db
    .select({
      id: books.id,
      image_url: books.image_url,
      thumbhash: books.thumbhash,
      title: books.title,
    })
    .from(books)
    .where(getWhereClause(query))
    .orderBy(books.id)
    .limit(ITEMS_PER_PAGE)
    .offset((query.page - 1) * ITEMS_PER_PAGE);
}

export async function getBooksCount(filters: BookFilters): Promise<number> {
  if (!db) return filterPreview(filters).length;

  const result = await db.select({ total: count() }).from(books).where(getWhereClause(filters));
  return result[0]?.total ?? 0;
}

export async function getBookById(id: string): Promise<BookDetails | undefined> {
  const bookId = Number(id);
  if (!Number.isInteger(bookId)) return undefined;

  if (!db) return PREVIEW_BOOKS.find(book => book.id === bookId);

  const result = await db
    .select({
      authorsJson: sql<string>`coalesce(json_group_array(${authors.name}) filter (where ${authors.name} is not null), '[]')`,
      average_rating: sql<string | null>`cast(${books.average_rating} as text)`,
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

  const book = result[0];
  if (!book) return undefined;

  const { authorsJson, ...details } = book;
  return { ...details, authors: JSON.parse(authorsJson) as string[] };
}
