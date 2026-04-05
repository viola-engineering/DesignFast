import queen from './queen-client.js';
import { processJob } from './process-job.js';

/**
 * Start a worker that consumes jobs from the designfast-jobs queue.
 * Uses the official queen-mq client with autoAck and proper error handling.
 * Non-blocking — consume runs in the background.
 */
export async function startWorker() {
  await queen
    .queue('designfast-jobs')
    .group('designfast-workers')
    .batch(5)
    .autoAck(false)
    .renewLease(true, 5000)
    .each()
    .concurrency(4)
    .consume(async (message) => {
      await processJob(message);
    })
    .onSuccess(async (message) => {
      await queen.ack(message, true, { group: 'designfast-workers' });
    })
    .onError(async (message, error) => {
      console.error('[worker] Job failed:', error.message);
      await queen.ack(message, false, { group: 'designfast-workers' });
    });

  console.log('[worker] Consuming from designfast-jobs');
}
