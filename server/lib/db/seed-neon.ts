import './load-env';
import os from 'node:os';
import { Pool } from 'pg';
import { EMPTY_IMAGE_URL, MAX_PAGES, MAX_YEAR, MIN_YEAR } from '../../../shared/utils/book-constants';

const BATCH_SIZE = 500;
const TARGET_BOOKS = Number(process.env.TARGET_BOOKS ?? 100_000);
const TARGET_MAX_DATABASE_MB = Number(process.env.TARGET_MAX_DATABASE_MB ?? 400);
const TARGET_MAX_DATABASE_BYTES = TARGET_MAX_DATABASE_MB * 1024 * 1024;
const targetDatabaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sourceDatabaseUrl =
  process.env.SOURCE_DATABASE_URL ??
  `postgresql://${encodeURIComponent(os.userInfo().username)}@localhost/nuxt-books`;

if (!targetDatabaseUrl) throw new Error('DATABASE_URL environment variable is not set');
if (!Number.isInteger(TARGET_BOOKS) || TARGET_BOOKS < 1) throw new Error('TARGET_BOOKS must be a positive integer');
if (!Number.isFinite(TARGET_MAX_DATABASE_MB) || TARGET_MAX_DATABASE_MB <= 0) {
  throw new Error('TARGET_MAX_DATABASE_MB must be positive');
}
if (targetDatabaseUrl === sourceDatabaseUrl) throw new Error('Source and target database URLs must be different');

const source = new Pool({ connectionString: sourceDatabaseUrl, max: 1 });
const target = new Pool({ connectionString: targetDatabaseUrl, max: 2 });

async function getTargetSize() {
  const result = await target.query<{ bytes: string }>(
    'SELECT pg_database_size(current_database())::bigint AS bytes',
  );
  return Number(result.rows[0]?.bytes ?? 0);
}

async function checkTargetBudget(label: string) {
  const bytes = await getTargetSize();
  const size = (bytes / 1024 / 1024).toFixed(1);
  console.log(`${label}: target database is ${size} MB / ${TARGET_MAX_DATABASE_MB} MB soft limit`);
  if (bytes > TARGET_MAX_DATABASE_BYTES) {
    throw new Error(`Target database exceeded the ${TARGET_MAX_DATABASE_MB} MB soft limit`);
  }
}

async function selectBooks() {
  await source.query('CREATE TEMP TABLE selected_book_ids (id integer PRIMARY KEY)');
  const result = await source.query(
    `INSERT INTO selected_book_ids
      SELECT id
      FROM books
      WHERE publication_year >= $1
        AND publication_year <= $2
        AND num_pages <= $3
        AND image_url IS NOT NULL
        AND image_url != $4
      ORDER BY ratings_count DESC NULLS LAST, id
      LIMIT $5`,
    [MIN_YEAR, MAX_YEAR, MAX_PAGES, EMPTY_IMAGE_URL, TARGET_BOOKS],
  );
  await source.query('ANALYZE selected_book_ids');
  console.log(`Selected ${result.rowCount?.toLocaleString() ?? 0} catalog books from the local database`);
}

async function copyAuthors() {
  let copied = 0;
  let lastId = '';

  while (true) {
    const result = await source.query(
      `SELECT DISTINCT a.id, a.name, a.average_rating, a.text_reviews_count, a.ratings_count
       FROM authors a
       JOIN book_to_author ba ON ba.author_id = a.id
       JOIN selected_book_ids selected ON selected.id = ba.book_id
       WHERE a.id > $1
       ORDER BY a.id
       LIMIT $2`,
      [lastId, BATCH_SIZE],
    );
    if (!result.rowCount) break;

    await target.query(
      `INSERT INTO authors (id, name, average_rating, text_reviews_count, ratings_count)
       SELECT id, name, average_rating, text_reviews_count, ratings_count
       FROM jsonb_to_recordset($1::jsonb) AS imported(
         id text,
         name text,
         average_rating numeric(3, 2),
         text_reviews_count integer,
         ratings_count integer
       )
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(result.rows)],
    );

    copied += result.rowCount;
    lastId = String(result.rows.at(-1)?.id);
    if (copied % 5_000 === 0) console.log(`Processed ${copied.toLocaleString()} authors`);
  }

  console.log(`Processed ${copied.toLocaleString()} referenced authors`);
  await checkTargetBudget('After authors');
}

async function copyBooks() {
  let copied = 0;
  let lastId = 0;

  while (true) {
    const result = await source.query(
      `SELECT b.*
       FROM books b
       JOIN selected_book_ids selected ON selected.id = b.id
       WHERE b.id > $1
       ORDER BY b.id
       LIMIT $2`,
      [lastId, BATCH_SIZE],
    );
    if (!result.rowCount) break;

    await target.query(
      `INSERT INTO books (
         id, isbn, isbn13, title, publication_year, publisher, image_url, description,
         num_pages, language_code, text_reviews_count, ratings_count, average_rating,
         series, popular_shelves, created_at, title_tsv, thumbhash
       )
       SELECT
         id, isbn, isbn13, title, publication_year, publisher, image_url, description,
         num_pages, language_code, text_reviews_count, ratings_count, average_rating,
         series, popular_shelves, created_at, title_tsv, thumbhash
       FROM jsonb_to_recordset($1::jsonb) AS imported(
         id integer,
         isbn text,
         isbn13 text,
         title text,
         publication_year integer,
         publisher text,
         image_url text,
         description text,
         num_pages integer,
         language_code text,
         text_reviews_count integer,
         ratings_count integer,
         average_rating numeric(3, 2),
         series text[],
         popular_shelves json,
         created_at timestamp,
         title_tsv text,
         thumbhash text
       )
       ON CONFLICT DO NOTHING`,
      [JSON.stringify(result.rows)],
    );

    copied += result.rowCount;
    lastId = Number(result.rows.at(-1)?.id);
    if (copied % 5_000 === 0) {
      console.log(`Processed ${copied.toLocaleString()} books`);
      await checkTargetBudget('Import progress');
    }
  }

  await target.query(
    `SELECT setval(
       pg_get_serial_sequence('books', 'id'),
       COALESCE((SELECT max(id) FROM books), 1)
     )`,
  );
  console.log(`Processed ${copied.toLocaleString()} books`);
}

async function copyBookAuthors() {
  let copied = 0;
  let lastBookId = 0;
  let lastAuthorId = '';

  while (true) {
    const result = await source.query(
      `SELECT ba.book_id, ba.author_id
       FROM book_to_author ba
       JOIN selected_book_ids selected ON selected.id = ba.book_id
       WHERE (ba.book_id, ba.author_id) > ($1, $2)
       ORDER BY ba.book_id, ba.author_id
       LIMIT $3`,
      [lastBookId, lastAuthorId, BATCH_SIZE],
    );
    if (!result.rowCount) break;

    await target.query(
      `INSERT INTO book_to_author (book_id, author_id)
       SELECT book_id, author_id
       FROM jsonb_to_recordset($1::jsonb) AS imported(book_id integer, author_id text)
       ON CONFLICT DO NOTHING`,
      [JSON.stringify(result.rows)],
    );

    copied += result.rowCount;
    const last = result.rows.at(-1);
    lastBookId = Number(last?.book_id);
    lastAuthorId = String(last?.author_id);
    if (copied % 5_000 === 0) console.log(`Processed ${copied.toLocaleString()} book-author links`);
  }

  console.log(`Processed ${copied.toLocaleString()} book-author links`);
}

async function main() {
  try {
    const tables = await target.query<{ books: string | null }>("SELECT to_regclass('public.books') AS books");
    if (!tables.rows[0]?.books) throw new Error('Target schema is missing; run pnpm db:migrate first');

    await checkTargetBudget('Before import');
    await selectBooks();
    await copyAuthors();
    await copyBooks();
    await copyBookAuthors();
    await target.query('ANALYZE authors, books, book_to_author');
    await checkTargetBudget('Import complete');
  } finally {
    await Promise.all([source.end(), target.end()]);
  }
}

main().catch(error => {
  console.error('Error seeding Neon:', error);
  process.exitCode = 1;
});
