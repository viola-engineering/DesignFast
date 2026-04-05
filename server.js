import 'dotenv/config';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';

import authRoutes from './routes/auth.js';
import generationsRoutes from './routes/generations.js';
import jobsRoutes from './routes/jobs.js';
import previewRoutes from './routes/preview.js';
import iterateRoutes from './routes/iterate.js';
import accountRoutes from './routes/account.js';
import billingRoutes from './routes/billing.js';

import { initQueues } from './queen-setup.js';
import * as queenClient from './queen-client.js';
import { startWorker } from './worker.js';

const app = Fastify({ logger: true });

await app.register(cookie);
await app.register(cors, {
  origin: true,
  credentials: true,
});

// Register route plugins — routes define their own full paths
await app.register(authRoutes);
await app.register(generationsRoutes);
await app.register(jobsRoutes);
await app.register(previewRoutes);
await app.register(iterateRoutes);
await app.register(accountRoutes);
await app.register(billingRoutes);

// Initialize queues and start worker
try {
  await initQueues();
} catch (err) {
  app.log.warn('Failed to initialize Queen queues (Queen may not be running): %s', err.message);
}

startWorker(queenClient);

const port = parseInt(process.env.PORT || '3000', 10);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };
