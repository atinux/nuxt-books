import { eq, sql } from 'drizzle-orm';
import { PREVIEW_BOOKS } from '../data/preview-books';
import { buildCatalogCountStatement, buildCatalogPageStatement } from '../lib/db/catalog-query';
import { db, requireSql } from '../lib/db/drizzle';
import { authors, books, bookToAuthor } from '../lib/db/schema';
import { EMPTY_IMAGE_URL, ITEMS_PER_PAGE, MIN_YEAR } from '#shared/utils/book-constants';
import type { Row } from '@libsql/client';
import type { BookDetails, BookSummary } from '#shared/types/book';
import type { BookFilters, BookQuery } from '#shared/utils/book-utils';

function toBookSummary(row: Row): BookSummary {
  return {
    id: Number(row.id),
    image_url: typeof row.image_url === 'string' ? row.image_url : null,
    thumbhash: typeof row.thumbhash === 'string' ? row.thumbhash : null,
    title: String(row.title),
  };
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

  const result = await requireSql().execute(buildCatalogPageStatement(query));
  return result.rows.map(toBookSummary);
}

export async function getBooksCount(filters: BookFilters): Promise<number> {
  if (!db) return filterPreview(filters).length;

  const result = await requireSql().execute(buildCatalogCountStatement(filters));
  return Number(result.rows[0]?.total ?? 0);
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
