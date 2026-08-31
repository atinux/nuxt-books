import './load-env';
import path from 'path';
import { requireSql } from './drizzle';
import { processEntities } from './seed-utils';
import type { NeonQueryFunction } from '@neondatabase/serverless';

const BATCH_SIZE = 900;
const DATA_FILE = path.resolve(process.env.BOOKS_DATA_PATH ?? './lib/db/books.json');
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

async function batchInsertBooks(batch: BookData[], sqlQuery: NeonQueryFunction<false, false>) {
  const insertBookAndAuthorsQuery = `
    WITH inserted_book AS (
      INSERT INTO books (id, isbn, isbn13, title, publication_year, publisher, image_url, description, num_pages, language_code, text_reviews_count, ratings_count, average_rating, series, popular_shelves, title_tsv)
      VALUES ($1::integer, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, unaccent($4))
      ON CONFLICT DO NOTHING
      RETURNING id
    )
    INSERT INTO book_to_author (book_id, author_id)
    SELECT inserted_book.id, unnest($16::text[])
    FROM inserted_book
    WHERE inserted_book.id IS NOT NULL
    ON CONFLICT DO NOTHING
  `;

  return sqlQuery.transaction(tx =>
    batch.map(book =>
      tx.query(insertBookAndAuthorsQuery, [
        parseInt(book.book_id),
        book.isbn || null,
        book.isbn13 || null,
        book.title,
        book.publication_year ? parseInt(book.publication_year) : null,
        book.publisher || null,
        book.image_url || null,
        book.description || null,
        book.num_pages ? parseInt(book.num_pages) : null,
        book.language_code || null,
        book.text_reviews_count ? parseInt(book.text_reviews_count) : null,
        book.ratings_count ? parseInt(book.ratings_count) : null,
        book.average_rating ? book.average_rating : null,
        book.series || null,
        JSON.stringify(book.popular_shelves),
        book.authors.map(author => author.author_id),
      ]),
    ),
  );
}

async function main() {
  try {
    const sql = requireSql();
    const bookCount = await processEntities<BookData>(
      DATA_FILE,
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertBooks,
      sql,
      TOTAL_BOOKS,
    );
    await sql.query("SELECT setval(pg_get_serial_sequence('books', 'id'), (SELECT max(id) FROM books))");
    console.log(`Seeded ${bookCount.toLocaleString()} / ${TOTAL_BOOKS.toLocaleString()} books`);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
