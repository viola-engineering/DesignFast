import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Sign a JWT containing the userId. Expires in 7 days.
 */
export function signToken(userId) {
  return jwt.sign({ userId }, getSecret(), { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT. Returns the payload ({ userId, iat, exp }).
 * Throws on invalid/expired token.
 */
export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

/**
 * Fastify onRequest hook that extracts and verifies the JWT from the
 * `token` cookie. Sets `req.userId` on success, replies 401 on failure.
 */
export async function authMiddleware(req, reply) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
    const payload = verifyToken(token);
    req.userId = payload.userId;
  } catch {
    return reply.code(401).send({ error: 'Not authenticated' });
  }
}
