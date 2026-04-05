import { consume, ack } from './queen-client.js';
import { processJob } from './process-job.js';
import { db } from './db.js';

/**
 * Start a worker that consumes jobs from the designfast-jobs queue.
 * Uses Promise.allSettled so one failing job doesn't block others.
 *
 * @param {object} queenClient - Queen client module (for pushing events)
 * @returns {{ stop: () => void }} - Call stop() to halt polling
 */
export function startWorker(queenClient) {
  const consumer = consume('designfast-jobs', 'designfast-workers', {
    batchSize: 5,
    waitTimeMs: 10000,
  }, async (messages) => {
    const results = await Promise.allSettled(
      messages.map(msg => processJob(msg, queenClient, db))
    );

    // Ack all messages — failed jobs are already marked in the DB by processJob
    for (let i = 0; i < messages.length; i++) {
      const success = results[i].status === 'fulfilled';
      try {
        await ack(messages[i], success, { consumerGroup: 'designfast-workers' });
      } catch (err) {
        console.error(`[worker] Failed to ack message:`, err.message);
      }
    }
  });

  console.log('[worker] Consuming from designfast-jobs');
  return consumer;
}
