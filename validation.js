const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * Validate that a param is a valid UUID. Returns 400 if not.
 * Usage: if (requireUUID(req.params.id, reply)) return;
 * Returns true (meaning "bail out") if invalid, false if valid.
 */
export function requireUUID(value, reply) {
  if (!isValidUUID(value)) {
    reply.code(400).send({ error: 'Invalid ID format' });
    return true;
  }
  return false;
}
