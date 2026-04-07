// Allowed origins for CORS
// Set ALLOWED_ORIGINS env var as comma-separated list, or use defaults
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultOrigins;

/**
 * Validate an origin against the allowlist
 * @param {string|undefined} origin - The Origin header value
 * @returns {string|false} - The origin if allowed, false otherwise
 */
export function validateOrigin(origin) {
  if (!origin) return false;
  return allowedOrigins.includes(origin) ? origin : false;
}

/**
 * Get a safe origin for CORS headers (for SSE routes)
 * Falls back to first allowed origin if request origin isn't allowed
 * @param {string|undefined} origin - The Origin header value
 * @returns {string} - A valid origin for the Access-Control-Allow-Origin header
 */
export function getSafeOrigin(origin) {
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  return allowedOrigins[0];
}
