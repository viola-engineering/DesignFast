/**
 * Shared in-memory store for active iterate sessions.
 *
 * Both the route handler (iterate.js) and the Queen consumer
 * (process-iterate.js) run in the same Node process, so they
 * share this Map.
 *
 * If the server restarts, sessions are lost. The user can start
 * a new session — it reads current files from Postgres, so no
 * work is lost.
 */
export const activeSessions = new Map();
