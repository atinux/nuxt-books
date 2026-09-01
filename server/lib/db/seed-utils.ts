import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createGunzip } from 'zlib';
import type { SqlClient } from './drizzle';

interface ImportCheckpoint {
  processedLines: number;
  scope: string;
}

export interface ProcessEntitiesResult {
  affectedEntities: number;
  processedLines: number;
}

export function createCheckpointScope(databaseUrl: string, filePath: string) {
  return createHash('sha256')
    .update(`${databaseUrl}\0${path.resolve(filePath)}`)
    .digest('hex');
}

export async function saveCheckpoint(checkpointFile: string, processedLines: number, scope: string) {
  await fs.promises.writeFile(checkpointFile, JSON.stringify({ processedLines, scope }), 'utf8');
}

export async function loadCheckpoint(checkpointFile: string, scope: string): Promise<number> {
  try {
    const data = await fs.promises.readFile(checkpointFile, 'utf8');
    const checkpoint = JSON.parse(data) as Partial<ImportCheckpoint>;

    if (
      checkpoint.scope !== scope ||
      !Number.isInteger(checkpoint.processedLines) ||
      Number(checkpoint.processedLines) < 0
    ) {
      console.log(`Ignoring checkpoint ${checkpointFile}: database or source file changed`);
      return 0;
    }

    return Number(checkpoint.processedLines);
  } catch {
    return 0;
  }
}

export async function processEntities<T>(
  filePath: string,
  checkpointFile: string,
  batchSize: number,
  batchInsertFunction: (batch: T[], sqlQuery: SqlClient) => Promise<number>,
  sqlQuery: SqlClient,
  totalEntities: number,
  checkpointScope: string,
): Promise<ProcessEntitiesResult> {
  const usesCheckpoints = totalEntities > batchSize;
  const startLine = usesCheckpoints ? await loadCheckpoint(checkpointFile, checkpointScope) : 0;
  let affectedEntities = 0;
  let processedLines = 0;
  let batch: T[] = [];
  const startTime = Date.now();

  const fileStream = fs.createReadStream(filePath);
  const input = filePath.endsWith('.gz') ? fileStream.pipe(createGunzip()) : fileStream;
  const rl = readline.createInterface({
    crlfDelay: Infinity,
    input,
  });

  for await (const line of rl) {
    if (processedLines < startLine) {
      processedLines++;
      continue;
    }

    let entity: T;
    try {
      entity = JSON.parse(line) as T;
    } catch (error) {
      processedLines++;
      console.error('Error processing line:', error);
      continue;
    }

    batch.push(entity);
    processedLines++;

    if (batch.length >= batchSize) {
      const batchStartTime = Date.now();
      affectedEntities += await batchInsertFunction(batch, sqlQuery);
      const batchEndTime = Date.now();
      batch = [];
      if (usesCheckpoints) {
        await saveCheckpoint(checkpointFile, processedLines, checkpointScope);
      }
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const batchSeconds = (batchEndTime - batchStartTime) / 1000;
      const remainingEntities = totalEntities - processedLines;
      const estimatedRemainingSeconds = (elapsedSeconds / processedLines) * remainingEntities;
      const progressPercentage = (processedLines / totalEntities) * 100;
      console.log(
        `Processed ${processedLines.toLocaleString()} / ${totalEntities.toLocaleString()} entities (${progressPercentage.toFixed(2)}%). ` +
          `Batch took ${batchSeconds.toFixed(2)}s. ` +
          `Estimated remaining time: ${(estimatedRemainingSeconds / 60).toFixed(2)} minutes`,
      );
    }
  }

  if (batch.length > 0) {
    affectedEntities += await batchInsertFunction(batch, sqlQuery);
    if (usesCheckpoints) {
      await saveCheckpoint(checkpointFile, processedLines, checkpointScope);
    }
  }

  const totalSeconds = (Date.now() - startTime) / 1000;
  console.log(`Total processing time: ${(totalSeconds / 60).toFixed(2)} minutes`);

  return { affectedEntities, processedLines };
}
