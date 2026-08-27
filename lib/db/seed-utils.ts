import fs from 'fs';
import readline from 'readline';
import { createGunzip } from 'zlib';
import type { NeonQueryFunction } from '@neondatabase/serverless';

export async function saveCheckpoint(checkpointFile: string, processedLines: number) {
  await fs.promises.writeFile(checkpointFile, JSON.stringify({ processedLines }), 'utf8');
}

export async function loadCheckpoint(checkpointFile: string): Promise<number> {
  try {
    const data = await fs.promises.readFile(checkpointFile, 'utf8');
    return JSON.parse(data).processedLines;
  } catch {
    return 0;
  }
}

export async function processEntities<T>(
  filePath: string,
  checkpointFile: string,
  batchSize: number,
  batchInsertFunction: (batch: T[], sqlQuery: NeonQueryFunction<false, false>) => Promise<unknown>,
  sqlQuery: NeonQueryFunction<false, false>,
  totalEntities: number,
): Promise<number> {
  const usesCheckpoints = totalEntities > batchSize;
  const startLine = usesCheckpoints ? await loadCheckpoint(checkpointFile) : 0;
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
      await batchInsertFunction(batch, sqlQuery);
      const batchEndTime = Date.now();
      batch = [];
      if (usesCheckpoints) {
        await saveCheckpoint(checkpointFile, processedLines);
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
    await batchInsertFunction(batch, sqlQuery);
    if (usesCheckpoints) {
      await saveCheckpoint(checkpointFile, processedLines);
    }
  }

  const totalSeconds = (Date.now() - startTime) / 1000;
  console.log(`Total processing time: ${(totalSeconds / 60).toFixed(2)} minutes`);

  return processedLines;
}
