import queen from './queen-client.js';

/**
 * Initialize Queen job queues. Idempotent — safe to call on every server start.
 */
export async function initQueues() {
  await Promise.all([
    queen.queue('designfast-jobs').config({
      retryLimit: 2,
      leaseTime: 600,
    }).create(),
    queen.queue('designfast-iterate').config({
      retryLimit: 1,
      leaseTime: 600,
    }).create(),
    queen.queue('designfast-events').config({
      retentionSeconds: 3600,
    }).create(),
  ]);
}
