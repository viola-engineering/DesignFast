import { query, getClient } from '../db.js';
import { signToken } from '../auth.js';
import { encrypt } from '../encryption.js';
import {
  generateState,
  buildGoogleAuthUrl,
  buildGithubAuthUrl,
  exchangeGoogleCode,
  exchangeGithubCode,
  isOAuthConfigured,
} from '../oauth.js';
import { formatUser } from '../format-user.js';

const STATE_COOKIE_NAME = 'oauth_state';
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Rate limit for OAuth callbacks to prevent abuse
const RATE_LIMITS = {
  oauthCallback: { max: 10, timeWindow: '15 minutes' },
};

/**
 * Get the frontend base URL for redirects after OAuth.
 */
function getFrontendUrl() {
  return process.env.BASE_URL || 'http://localhost:5173';
}

/**
 * Set the JWT token cookie and redirect to frontend.
 */
function loginAndRedirect(userId, reply, redirectPath = '/generate') {
  const token = signToken(userId);
  reply.setCookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return reply.redirect(`${getFrontendUrl()}${redirectPath}`);
}

/**
 * Redirect to frontend with an error.
 */
function redirectWithError(reply, error) {
  const errorMessage = encodeURIComponent(error);
  return reply.redirect(`${getFrontendUrl()}/login?error=${errorMessage}`);
}

/**
 * Find or create user from OAuth profile, handling account linking.
 * @param {object} client - Database client for transaction
 * @param {string} provider - 'google' or 'github'
 * @param {object} profile - OAuth profile with id, email, name, etc.
 * @returns {Promise<{userId: string, isNewUser: boolean}>}
 */
async function findOrCreateOAuthUser(client, provider, profile) {
  // 1. Check if this OAuth identity already exists
  const { rows: existingIdentity } = await client.query(
    `SELECT user_id FROM designfast.oauth_identities
     WHERE provider = $1 AND provider_user_id = $2`,
    [provider, profile.id]
  );

  if (existingIdentity.length > 0) {
    // Update tokens if we have them
    if (profile.accessToken) {
      await client.query(
        `UPDATE designfast.oauth_identities
         SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = NOW()
         WHERE provider = $4 AND provider_user_id = $5`,
        [
          encrypt(profile.accessToken),
          profile.refreshToken ? encrypt(profile.refreshToken) : null,
          profile.expiresAt || null,
          provider,
          profile.id,
        ]
      );
    }
    return { userId: existingIdentity[0].user_id, isNewUser: false };
  }

  // 2. Check if email matches existing user (account linking)
  const { rows: existingUser } = await client.query(
    `SELECT id FROM designfast.users WHERE email = $1`,
    [profile.email]
  );

  let userId;
  let isNewUser = false;

  if (existingUser.length > 0) {
    // Link OAuth to existing account
    userId = existingUser[0].id;
    // Update avatar if user doesn't have one
    const avatarField = provider === 'google' ? profile.picture : profile.avatarUrl;
    if (avatarField) {
      await client.query(
        `UPDATE designfast.users SET avatar_url = COALESCE(avatar_url, $1) WHERE id = $2`,
        [avatarField, userId]
      );
    }
  } else {
    // 3. Create new user
    const avatarUrl = provider === 'google' ? profile.picture : profile.avatarUrl;
    const { rows: newUser } = await client.query(
      `INSERT INTO designfast.users (email, name, avatar_url, email_verified_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [profile.email, profile.name, avatarUrl]
    );
    userId = newUser[0].id;
    isNewUser = true;
  }

  // Create OAuth identity link
  await client.query(
    `INSERT INTO designfast.oauth_identities
     (user_id, provider, provider_user_id, provider_email, access_token, refresh_token, token_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      provider,
      profile.id,
      profile.email,
      profile.accessToken ? encrypt(profile.accessToken) : null,
      profile.refreshToken ? encrypt(profile.refreshToken) : null,
      profile.expiresAt || null,
    ]
  );

  return { userId, isNewUser };
}

export default async function (app) {
  // ==================== GOOGLE OAUTH ====================

  // GET /api/auth/oauth/google - Initiate Google OAuth flow
  app.get('/api/auth/oauth/google', async (req, reply) => {
    if (!isOAuthConfigured('google')) {
      return reply.code(501).send({ error: 'Google OAuth is not configured' });
    }

    const state = generateState();

    // Store state in cookie for validation
    reply.setCookie(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: STATE_EXPIRY_MS / 1000,
    });

    const authUrl = buildGoogleAuthUrl(state);
    return reply.redirect(authUrl);
  });

  // GET /api/auth/oauth/google/callback - Handle Google OAuth callback
  app.get('/api/auth/oauth/google/callback', {
    config: { rateLimit: RATE_LIMITS.oauthCallback }
  }, async (req, reply) => {
    const { code, state, error: oauthError } = req.query;

    // Clear state cookie
    reply.clearCookie(STATE_COOKIE_NAME, { path: '/' });

    // Handle OAuth errors (user denied, etc.)
    if (oauthError) {
      return redirectWithError(reply, `Google sign-in was cancelled or failed: ${oauthError}`);
    }

    // Validate state
    const storedState = req.cookies[STATE_COOKIE_NAME];
    if (!state || !storedState || state !== storedState) {
      return redirectWithError(reply, 'Invalid OAuth state. Please try again.');
    }

    if (!code) {
      return redirectWithError(reply, 'No authorization code received from Google.');
    }

    const client = await getClient();
    try {
      // Exchange code for profile
      const profile = await exchangeGoogleCode(code);

      await client.query('BEGIN');
      const { userId } = await findOrCreateOAuthUser(client, 'google', profile);
      await client.query('COMMIT');

      return loginAndRedirect(userId, reply);
    } catch (err) {
      await client.query('ROLLBACK');
      app.log.error('Google OAuth error:', err);
      return redirectWithError(reply, 'Failed to sign in with Google. Please try again.');
    } finally {
      client.release();
    }
  });

  // ==================== GITHUB OAUTH ====================

  // GET /api/auth/oauth/github - Initiate GitHub OAuth flow
  app.get('/api/auth/oauth/github', async (req, reply) => {
    if (!isOAuthConfigured('github')) {
      return reply.code(501).send({ error: 'GitHub OAuth is not configured' });
    }

    const state = generateState();

    // Store state in cookie for validation
    reply.setCookie(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: STATE_EXPIRY_MS / 1000,
    });

    const authUrl = buildGithubAuthUrl(state);
    return reply.redirect(authUrl);
  });

  // GET /api/auth/oauth/github/callback - Handle GitHub OAuth callback
  app.get('/api/auth/oauth/github/callback', {
    config: { rateLimit: RATE_LIMITS.oauthCallback }
  }, async (req, reply) => {
    const { code, state, error: oauthError, error_description } = req.query;

    // Clear state cookie
    reply.clearCookie(STATE_COOKIE_NAME, { path: '/' });

    // Handle OAuth errors (user denied, etc.)
    if (oauthError) {
      const message = error_description || oauthError;
      return redirectWithError(reply, `GitHub sign-in was cancelled or failed: ${message}`);
    }

    // Validate state
    const storedState = req.cookies[STATE_COOKIE_NAME];
    if (!state || !storedState || state !== storedState) {
      return redirectWithError(reply, 'Invalid OAuth state. Please try again.');
    }

    if (!code) {
      return redirectWithError(reply, 'No authorization code received from GitHub.');
    }

    const client = await getClient();
    try {
      // Exchange code for profile
      const profile = await exchangeGithubCode(code);

      await client.query('BEGIN');
      const { userId } = await findOrCreateOAuthUser(client, 'github', profile);
      await client.query('COMMIT');

      return loginAndRedirect(userId, reply);
    } catch (err) {
      await client.query('ROLLBACK');
      app.log.error('GitHub OAuth error:', err);
      const message = err.message.includes('email')
        ? err.message
        : 'Failed to sign in with GitHub. Please try again.';
      return redirectWithError(reply, message);
    } finally {
      client.release();
    }
  });

  // ==================== OAUTH STATUS ====================

  // GET /api/auth/oauth/providers - Get available OAuth providers
  app.get('/api/auth/oauth/providers', async (req, reply) => {
    return {
      google: isOAuthConfigured('google'),
      github: isOAuthConfigured('github'),
    };
  });
}
