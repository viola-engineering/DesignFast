import queen from './queen-client.js';
import { processJob } from './process-job.js';
import { processIterate } from './process-iterate.js';

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

/**
 * Start a worker that consumes iterate tasks from the designfast-iterate queue.
 * Runs in the same process as the API server so it can access activeSessions.
 * Concurrency 2 — iterate tasks are sequential per session (agent state).
 */
export async function startIterateWorker() {
  await queen
    .queue('designfast-iterate')
    .group('designfast-iterate-workers')
    .batch(5)
    .autoAck(false)
    .renewLease(true, 5000)
    .each()
    .concurrency(2)
    .consume(async (message) => {
      await processIterate(message);
    })
    .onSuccess(async (message) => {
      await queen.ack(message, true, { group: 'designfast-iterate-workers' });
    })
    .onError(async (message, error) => {
      console.error('[worker] Iterate task failed:', error.message);
      await queen.ack(message, false, { group: 'designfast-iterate-workers' });
    });

  console.log('[worker] Consuming from designfast-iterate');
}
