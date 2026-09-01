import './load-env';
import path from 'path';
import { requireDatabaseUrl, requireSql } from './drizzle';
import { createCheckpointScope, processEntities } from './seed-utils';
import type { SqlClient } from './drizzle';

const BATCH_SIZE = 2000;
const DATA_FILE = path.resolve(process.env.AUTHORS_DATA_PATH ?? './server/lib/db/authors.json');
const CHECKPOINT_FILE = path.resolve(process.env.AUTHORS_CHECKPOINT_PATH ?? 'author_import_checkpoint.json');

// https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_book_authors.json.gz
const TOTAL_AUTHORS = Number(process.env.TOTAL_AUTHORS ?? 4);

interface AuthorData {
  average_rating: string;
  author_id: string;
  text_reviews_count: string;
  name: string;
  ratings_count: string;
}

async function batchInsertAuthors(batch: AuthorData[], sqlQuery: SqlClient) {
  const insertQuery = `
    INSERT OR IGNORE INTO authors (id, name, average_rating, text_reviews_count, ratings_count)
    SELECT
      CAST(json_extract(value, '$.id') AS TEXT),
      json_extract(value, '$.name'),
      CAST(json_extract(value, '$.average_rating') AS REAL),
      CAST(json_extract(value, '$.text_reviews_count') AS INTEGER),
      CAST(json_extract(value, '$.ratings_count') AS INTEGER)
    FROM json_each(?)
  `;

  const authors = batch.map(author => ({
    average_rating: Number(author.average_rating),
    id: author.author_id,
    name: author.name,
    ratings_count: Number(author.ratings_count),
    text_reviews_count: Number(author.text_reviews_count),
  }));

  const results = await sqlQuery.batch([{ args: [JSON.stringify(authors)], sql: insertQuery }], 'write');
  return results[0]?.rowsAffected ?? 0;
}

async function main() {
  try {
    const sql = requireSql();
    const checkpointScope = createCheckpointScope(requireDatabaseUrl(), DATA_FILE);
    const { affectedEntities, processedLines } = await processEntities<AuthorData>(
      DATA_FILE,
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertAuthors,
      sql,
      TOTAL_AUTHORS,
      checkpointScope,
    );
    console.log(
      `Inserted ${affectedEntities.toLocaleString()} authors (${processedLines.toLocaleString()} / ${TOTAL_AUTHORS.toLocaleString()} lines processed)`,
    );
  } catch (error) {
    console.error('Error seeding authors:', error);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
