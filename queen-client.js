/**
 * Thin HTTP client for the Queen job queue server (v1 API).
 *
 * Queen API endpoints (verified against smartnessai/queen-mq:0.12.x):
 *   POST /api/v1/configure  — create/update queue config
 *   POST /api/v1/push       — push messages (each item specifies its queue)
 *   GET  /api/v1/pop/queue/:name — pop messages (supports long-polling via waitTimeMs)
 *   POST /api/v1/ack        — ack/nack a message by transactionId
 */

function getBaseUrl() {
  return (process.env.QUEEN_URL || 'http://localhost:6632').replace(/\/$/, '');
}

async function request(method, path, body) {
  const url = `${getBaseUrl()}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Queen ${method} ${path} failed (${res.status}): ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

/**
 * Create or update a queue with the given config.
 * POST /api/v1/configure { queue, options }
 */
export async function createQueue(name, config = {}) {
  return request('POST', '/api/v1/configure', { queue: name, options: config });
}

/**
 * Push messages to a queue.
 * POST /api/v1/push { items: [{ queue, partition?, payload }] }
 *
 * @param {string} queue - Queue name
 * @param {Array} messages - Array of message payloads (each should have a `data` key or be a raw payload)
 * @param {object} opts - Options (e.g. { partition: string })
 */
export async function push(queue, messages, opts = {}) {
  const items = messages.map(msg => {
    const item = {
      queue,
      payload: msg.data !== undefined ? msg.data : msg,
    };
    if (opts.partition) {
      item.partition = opts.partition;
    }
    if (msg.partition) {
      item.partition = msg.partition;
    }
    return item;
  });
  return request('POST', '/api/v1/push', { items });
}

/**
 * Start a polling consumer for a queue.
 * Returns an object with a stop() method to halt polling.
 *
 * @param {string} queue - Queue name
 * @param {string} group - Consumer group name
 * @param {object} opts - Polling options (e.g. { batchSize, waitTimeMs })
 * @param {function} handler - Async function called with each batch of messages
 */
export function consume(queue, group, opts = {}, handler) {
  let running = true;
  const batchSize = opts.batchSize || 1;
  const waitTimeMs = opts.waitTimeMs || 5000;

  const poll = async () => {
    while (running) {
      try {
        const params = new URLSearchParams({
          batchSize: String(batchSize),
          waitTimeMs: String(waitTimeMs),
        });
        if (group) {
          params.set('group', group);
        }
        const data = await request(
          'GET',
          `/api/v1/pop/queue/${encodeURIComponent(queue)}?${params.toString()}`
        );
        const messages = data?.messages || [];
        if (messages.length > 0) {
          await handler(messages, data);
        }
      } catch (err) {
        if (running) {
          console.error(`[queen-client] consume error on ${queue}/${group}:`, err.message);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  };

  poll();

  return {
    stop() {
      running = false;
    },
  };
}

/**
 * Acknowledge (or nack) a message.
 * POST /api/v1/ack { transactionId, partitionId, leaseId, status }
 *
 * @param {object} message - Message object from pop (must have transactionId, partitionId, leaseId)
 * @param {boolean} success - true to ack (completed), false to nack (failed)
 * @param {object} opts - Additional options (e.g. { consumerGroup, error })
 */
export async function ack(message, success = true, opts = {}) {
  const body = {
    transactionId: message.transactionId,
    partitionId: message.partitionId,
    leaseId: message.leaseId,
    status: success ? 'completed' : 'failed',
  };
  if (opts.consumerGroup) {
    body.consumerGroup = opts.consumerGroup;
  }
  if (opts.error) {
    body.error = opts.error;
  }
  return request('POST', '/api/v1/ack', body);
}
