import { createQueue } from './queen-client.js';

/**
 * Initialize Queen job queues. Idempotent — safe to call on every server start.
 */
export async function initQueues() {
  await Promise.all([
    createQueue('designfast-jobs', {
      retryLimit: 2,
      leaseTime: 600,
    }),
    createQueue('designfast-events', {
      ttl: 3600,
    }),
  ]);
}
