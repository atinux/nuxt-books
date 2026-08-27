import "./load-env";
import path from "path";
import { requireSql } from "./drizzle";
import { NeonQueryFunction } from "@neondatabase/serverless";
import { processEntities } from "./seed-utils";

const BATCH_SIZE = 2000;
const DATA_FILE = path.resolve(
  process.env.AUTHORS_DATA_PATH ?? "./lib/db/authors.json",
);
const CHECKPOINT_FILE = path.resolve(
  process.env.AUTHORS_CHECKPOINT_PATH ?? "author_import_checkpoint.json",
);

// https://mcauleylab.ucsd.edu/public_datasets/gdrive/goodreads/goodreads_book_authors.json.gz
const TOTAL_AUTHORS = Number(process.env.TOTAL_AUTHORS ?? 4);

interface AuthorData {
  average_rating: string;
  author_id: string;
  text_reviews_count: string;
  name: string;
  ratings_count: string;
}

async function batchInsertAuthors(
  batch: AuthorData[],
  sqlQuery: NeonQueryFunction<false, false>,
) {
  const insertQuery = `
    INSERT INTO authors (id, name, average_rating, text_reviews_count, ratings_count)
    VALUES ($1, $2, $3::numeric, $4::integer, $5::integer)
    ON CONFLICT (id) DO NOTHING
  `;

  const queries = batch.map((author) =>
    sqlQuery.query(insertQuery, [
      author.author_id,
      author.name,
      author.average_rating,
      author.text_reviews_count,
      author.ratings_count,
    ]),
  );

  await sqlQuery.transaction(queries);
}

async function main() {
  try {
    const sql = requireSql();
    const authorCount = await processEntities<AuthorData>(
      DATA_FILE,
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertAuthors,
      sql,
      TOTAL_AUTHORS,
    );
    console.log(
      `Seeded ${authorCount.toLocaleString()} / ${TOTAL_AUTHORS.toLocaleString()} authors`,
    );
  } catch (error) {
    console.error("Error seeding authors:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
