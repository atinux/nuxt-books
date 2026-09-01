import './load-env';
import path from 'path';
import { requireDatabaseUrl, requireSql } from './drizzle';
import { createCheckpointScope, processEntities } from './seed-utils';
import type { SqlClient } from './drizzle';

const BATCH_SIZE = 900;
const DATA_FILE = path.resolve(process.env.BOOKS_DATA_PATH ?? './server/lib/db/books.json');
const CHECKPOINT_FILE = path.resolve(process.env.BOOKS_CHECKPOINT_PATH ?? 'book_import_checkpoint.json');

// https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_books.json.gz
const TOTAL_BOOKS = Number(process.env.TOTAL_BOOKS ?? 4);

interface BookData {
  book_id: string;
  isbn: string | null;
  isbn13: string | null;
  title: string;
  authors: { author_id: string }[];
  publication_year: string | null;
  publisher: string | null;
  image_url: string | null;
  description: string | null;
  num_pages: string | null;
  language_code: string | null;
  text_reviews_count: string | null;
  ratings_count: string | null;
  average_rating: string | null;
  series: string[] | null;
  popular_shelves: { count: string; name: string }[];
}

async function batchInsertBooks(batch: BookData[], sqlQuery: SqlClient) {
  const insertBooksQuery = `
    INSERT OR IGNORE INTO books (id, isbn, isbn13, title, publication_year, publisher, image_url, description, num_pages, language_code, text_reviews_count, ratings_count, average_rating, series, popular_shelves)
    SELECT
      CAST(json_extract(value, '$.id') AS INTEGER),
      json_extract(value, '$.isbn'),
      json_extract(value, '$.isbn13'),
      json_extract(value, '$.title'),
      CAST(json_extract(value, '$.publication_year') AS INTEGER),
      json_extract(value, '$.publisher'),
      json_extract(value, '$.image_url'),
      json_extract(value, '$.description'),
      CAST(json_extract(value, '$.num_pages') AS INTEGER),
      json_extract(value, '$.language_code'),
      CAST(json_extract(value, '$.text_reviews_count') AS INTEGER),
      CAST(json_extract(value, '$.ratings_count') AS INTEGER),
      CAST(json_extract(value, '$.average_rating') AS REAL),
      json_extract(value, '$.series'),
      json_extract(value, '$.popular_shelves')
    FROM json_each(?)
  `;

  const insertAuthorsQuery = `
    INSERT OR IGNORE INTO book_to_author (book_id, author_id)
    SELECT
      CAST(json_extract(value, '$[0]') AS INTEGER),
      CAST(json_extract(value, '$[1]') AS TEXT)
    FROM json_each(?)
    WHERE EXISTS (
      SELECT 1 FROM books WHERE books.id = CAST(json_extract(value, '$[0]') AS INTEGER)
    ) AND EXISTS (
      SELECT 1 FROM authors WHERE authors.id = CAST(json_extract(value, '$[1]') AS TEXT)
    )
  `;

  const books = batch.map(book => ({
    average_rating: book.average_rating ? Number(book.average_rating) : null,
    description: book.description || null,
    id: Number(book.book_id),
    image_url: book.image_url || null,
    isbn: book.isbn || null,
    isbn13: book.isbn13 || null,
    language_code: book.language_code || null,
    num_pages: book.num_pages ? Number(book.num_pages) : null,
    popular_shelves: book.popular_shelves,
    publication_year: book.publication_year ? Number(book.publication_year) : null,
    publisher: book.publisher || null,
    ratings_count: book.ratings_count ? Number(book.ratings_count) : null,
    series: book.series,
    text_reviews_count: book.text_reviews_count ? Number(book.text_reviews_count) : null,
    title: book.title,
  }));
  const bookAuthors = batch.flatMap(book =>
    book.authors.map(author => [Number(book.book_id), author.author_id] as const),
  );
  const statements = [{ args: [JSON.stringify(books)], sql: insertBooksQuery }];

  if (bookAuthors.length) {
    statements.push({ args: [JSON.stringify(bookAuthors)], sql: insertAuthorsQuery });
  }

  const results = await sqlQuery.batch(statements, 'write');
  return results[0]?.rowsAffected ?? 0;
}

async function main() {
  try {
    const sql = requireSql();
    const checkpointScope = createCheckpointScope(requireDatabaseUrl(), DATA_FILE);
    const { affectedEntities, processedLines } = await processEntities<BookData>(
      DATA_FILE,
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertBooks,
      sql,
      TOTAL_BOOKS,
      checkpointScope,
    );
    console.log(
      `Inserted ${affectedEntities.toLocaleString()} books (${processedLines.toLocaleString()} / ${TOTAL_BOOKS.toLocaleString()} lines processed)`,
    );
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
