import { EventEmitter } from 'node:events';
import os from 'node:os';
import queen from './queen-client.js';

const bus = new EventEmitter();
bus.setMaxListeners(0); // unlimited SSE connections

// Unique consumer group per API instance — ensures every instance receives every event
const instanceId = `${os.hostname()}`;

/**
 * Start a single long-running consumer for designfast-events.
 * Dispatches events to in-memory listeners keyed by jobId and/or sessionId.
 * Each API instance has its own consumer group for fan-out delivery.
 */
export async function startEventConsumer() {
  const groupName = `sse-${instanceId}`;
  console.log(`[event-bus] Starting consumer with group: ${groupName}`);

  await queen
    .queue('designfast-events')
    .group(groupName)
    .batch(10)
    .autoAck(true)
    .each()
    .consume(async (message) => {
      const event = message.data || message;
      if (event.jobId) {
        bus.emit(event.jobId, event);
      }
      if (event.sessionId) {
        bus.emit(`session:${event.sessionId}`, event);
      }
    })

  console.log('[event-bus] Consuming from designfast-events');
}

export default bus;
