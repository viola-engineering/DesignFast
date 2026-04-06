import { EventEmitter } from 'node:events';
import queen from './queen-client.js';

const bus = new EventEmitter();
bus.setMaxListeners(0); // unlimited SSE connections

/**
 * Start a single long-running consumer for designfast-events.
 * Dispatches events to in-memory listeners keyed by jobId and/or sessionId.
 */
export async function startEventConsumer() {
  await queen
    .queue('designfast-events')
    .group('sse-consumers')
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
