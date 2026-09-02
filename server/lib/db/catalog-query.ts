import {
  EMPTY_IMAGE_URL,
  ITEMS_PER_PAGE,
  MAX_PAGES,
  MAX_YEAR,
  MIN_RATING,
  MIN_YEAR,
} from '../../../shared/utils/book-constants';
import type { BookFilters, BookQuery } from '../../../shared/utils/book-utils';
import type { InValue } from '@libsql/client';

const CATALOG_INDEX = 'idx_books_catalog';

const toFtsQuery = (search: string) =>
  search
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `"${term.replaceAll('"', '""')}"`)
    .join(' AND ');

function getCatalogWhereClause({ isbns, language, maxPages, rating, search, year }: BookFilters) {
  // These literals must match the partial index predicate. Parameters cannot
  // prove partial-index applicability because SQLite plans before binding them.
  const conditions = [
    `publication_year >= ${MIN_YEAR}`,
    `publication_year <= ${MAX_YEAR}`,
    `num_pages <= ${MAX_PAGES}`,
    'image_url IS NOT NULL',
    `image_url != '${EMPTY_IMAGE_URL}'`,
  ];
  const args: InValue[] = [];

  if (year < MAX_YEAR) {
    conditions.push('publication_year <= ?');
    args.push(year);
  }
  if (maxPages < MAX_PAGES) {
    conditions.push('num_pages <= ?');
    args.push(maxPages);
  }
  if (rating > MIN_RATING) {
    conditions.push('average_rating >= ?');
    args.push(rating);
  }
  if (language === 'en') {
    conditions.push("language_code IN ('eng', 'en-US', 'en-GB')");
  } else if (language) {
    conditions.push('language_code = ?');
    args.push(language);
  }

  const ftsQuery = toFtsQuery(search);
  if (ftsQuery) {
    conditions.push('id IN (SELECT rowid FROM books_fts WHERE books_fts MATCH ?)');
    args.push(ftsQuery);
  }

  const isbnValues = isbns
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (isbnValues.length) {
    conditions.push(`isbn IN (${isbnValues.map(() => '?').join(', ')})`);
    args.push(...isbnValues);
  }

  return { args, sql: conditions.join(' AND ') };
}

export function buildCatalogPageStatement(query: BookQuery) {
  const where = getCatalogWhereClause(query);
  return {
    args: [...where.args, ITEMS_PER_PAGE, (query.page - 1) * ITEMS_PER_PAGE],
    sql: `SELECT id, title, image_url, thumbhash
      FROM books INDEXED BY ${CATALOG_INDEX}
      WHERE ${where.sql}
      ORDER BY id
      LIMIT ? OFFSET ?`,
  };
}

export function buildCatalogCountStatement(filters: BookFilters) {
  const where = getCatalogWhereClause(filters);
  return {
    args: where.args,
    sql: `SELECT count(*) AS total
      FROM books INDEXED BY ${CATALOG_INDEX}
      WHERE ${where.sql}`,
  };
}
