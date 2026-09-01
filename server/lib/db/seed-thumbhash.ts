import './load-env';
import path from 'path';
import pLimit from 'p-limit';
import sharp from 'sharp';
import * as ThumbHash from 'thumbhash';
import { EMPTY_IMAGE_URL } from '../../../shared/utils/book-constants';
import { requireDatabaseUrl, requireSql } from './drizzle';
import { createCheckpointScope, processEntities } from './seed-utils';
import type { SqlClient } from './drizzle';

const BATCH_SIZE = 900;
const CHECKPOINT_FILE = 'thumbhash_update_checkpoint.json';
const TOTAL_BOOKS = 4; // 2360655 in full dataset, 4 in sample data
const CONCURRENCY_LIMIT = 10;

interface BookData {
  image_url: string | null;
}

const limit = pLimit(CONCURRENCY_LIMIT);

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url} - Status: ${response.status}`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`Error fetching image: ${url}`, error);
    return null;
  }
}

async function generateThumbHash(imageBuffer: Buffer): Promise<string | null> {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(100, 100, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const binaryThumbHash = ThumbHash.rgbaToThumbHash(info.width, info.height, data);
    return Buffer.from(binaryThumbHash).toString('base64');
  } catch (error) {
    console.error('Error generating thumbhash:', error);
    return null;
  }
}

async function processBook(book: BookData): Promise<[string, string] | null> {
  if (book.image_url && book.image_url !== EMPTY_IMAGE_URL) {
    const imageBuffer = await fetchImage(book.image_url);
    if (imageBuffer) {
      const thumbHash = await generateThumbHash(imageBuffer);
      if (thumbHash) {
        return [thumbHash, book.image_url];
      }
    }
  }
  return null;
}

async function batchUpdateThumbHash(batch: BookData[], sqlQuery: SqlClient) {
  const updateThumbhashQuery = `
    UPDATE books
    SET thumbhash = ?
    WHERE image_url = ?
  `;

  const processedBooks = await Promise.all(batch.map(book => limit(() => processBook(book))));
  const statements = processedBooks
    .filter((result): result is [string, string] => result !== null)
    .map(([thumbHash, imageUrl]) => ({ args: [thumbHash, imageUrl], sql: updateThumbhashQuery }));

  if (!statements.length) return 0;

  const results = await sqlQuery.batch(statements, 'write');
  return results.reduce((total, result) => total + result.rowsAffected, 0);
}

async function main() {
  try {
    const sql = requireSql();
    const dataFile = path.resolve('./server/lib/db/books.json');
    const checkpointScope = createCheckpointScope(requireDatabaseUrl(), dataFile);
    const { affectedEntities, processedLines } = await processEntities<BookData>(
      dataFile,
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchUpdateThumbHash,
      sql,
      TOTAL_BOOKS,
      checkpointScope,
    );
    console.log(
      `Updated thumbhash for ${affectedEntities.toLocaleString()} books (${processedLines.toLocaleString()} / ${TOTAL_BOOKS.toLocaleString()} lines processed)`,
    );
  } catch (error) {
    console.error('Error updating thumbhash:', error);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
