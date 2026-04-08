import 'dotenv/config';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';

import { allowedOrigins } from './cors.js';

/**
 * Extract the real client IP when behind Cloudflare Tunnel.
 * Falls back to req.ip for local development.
 */
function getClientIp(req) {
  return req.headers['cf-connecting-ip'] || req.ip;
}

import authRoutes from './routes/auth.js';
import generationsRoutes from './routes/generations.js';
import jobsRoutes from './routes/jobs.js';
import previewRoutes from './routes/preview.js';
import iterateRoutes from './routes/iterate.js';
import accountRoutes from './routes/account.js';
import billingRoutes from './routes/billing.js';
import uploadsRoutes from './routes/uploads.js';
import examplesRoutes from './routes/examples.js';
import configRoutes from './routes/config.js';

import { initQueues } from './queen-setup.js';
import { startWorker, startIterateWorker } from './worker.js';
import { startEventConsumer } from './event-bus.js';

// MODE: 'api' = only web server, 'worker' = only job workers, undefined = both (dev mode)
const MODE = process.env.MODE;

const app = Fastify({ logger: true });

await app.register(cookie);
await app.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
});

// Rate limiting — uses CF-Connecting-IP when behind Cloudflare Tunnel
await app.register(rateLimit, {
  global: false, // Disable global limit, apply per-route
  keyGenerator: getClientIp,
  // Store in memory — for multi-instance deployments, use Redis instead
});

// Export for use in route files
export { getClientIp };

await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 1,                   // one file per request
  },
});

// Add raw body support for Stripe webhooks
app.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
  // Store raw body on the raw request for later access
  req.rawBody = body;
  try {
    const json = JSON.parse(body.toString());
    done(null, json);
  } catch (err) {
    done(err, undefined);
  }
});

// Hook to copy rawBody from raw request to Fastify request
app.addHook('preHandler', async (request) => {
  if (request.raw.rawBody) {
    request.rawBody = request.raw.rawBody;
  }
});

// Register route plugins — routes define their own full paths
await app.register(authRoutes);
await app.register(generationsRoutes);
await app.register(jobsRoutes);
await app.register(previewRoutes);
await app.register(iterateRoutes);
await app.register(accountRoutes);
await app.register(billingRoutes);
await app.register(uploadsRoutes);
await app.register(examplesRoutes);
await app.register(configRoutes);

// Initialize queues
try {
  await initQueues();
} catch (err) {
  app.log.warn('Failed to initialize Queen queues (Queen may not be running): %s', err.message);
}

// Start workers if MODE is 'worker' or undefined (dev mode)
if (MODE !== 'api') {
  startWorker();
  startIterateWorker();
  app.log.info('Workers started');
}

// Start event consumer in API (or dev mode) — NOT in workers
// Each API instance needs its own consumer group for fan-out
if (MODE !== 'worker') {
  startEventConsumer();
}

// Start API server if MODE is 'api' or undefined (dev mode)
if (MODE !== 'worker') {
  const port = parseInt(process.env.PORT || '5000', 10);
  try {
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
} else {
  // Keep worker process alive
  app.log.info('Running in worker-only mode');
}

export { app };
