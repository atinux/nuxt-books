import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { processEntities } from './seed-utils';
import type { SqlClient } from './drizzle';

test('ignores a checkpoint created for a different database target', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nuxt-books-seed-'));
  const checkpointFile = path.join(directory, 'checkpoint.json');
  const dataFile = path.join(directory, 'entities.json');

  try {
    await fs.writeFile(dataFile, '{"id":1}\n{"id":2}\n');
    await fs.writeFile(checkpointFile, JSON.stringify({ processedLines: 2, scope: 'database-a' }));

    let insertedEntities = 0;
    const result = await processEntities<{ id: number }>(
      dataFile,
      checkpointFile,
      1,
      async batch => {
        insertedEntities += batch.length;
        return batch.length;
      },
      {} as SqlClient,
      2,
      'database-b',
    );

    assert.equal(insertedEntities, 2);
    assert.deepEqual(result, { affectedEntities: 2, processedLines: 2 });
  } finally {
    await fs.rm(directory, { force: true, recursive: true });
  }
});

test('resumes a checkpoint created for the same database target', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nuxt-books-seed-'));
  const checkpointFile = path.join(directory, 'checkpoint.json');
  const dataFile = path.join(directory, 'entities.json');

  try {
    await fs.writeFile(dataFile, '{"id":1}\n{"id":2}\n');
    await fs.writeFile(checkpointFile, JSON.stringify({ processedLines: 1, scope: 'database-a' }));

    let insertedEntities = 0;
    const result = await processEntities<{ id: number }>(
      dataFile,
      checkpointFile,
      1,
      async batch => {
        insertedEntities += batch.length;
        return batch.length;
      },
      {} as SqlClient,
      2,
      'database-a',
    );

    assert.equal(insertedEntities, 1);
    assert.deepEqual(result, { affectedEntities: 1, processedLines: 2 });
  } finally {
    await fs.rm(directory, { force: true, recursive: true });
  }
});
