import crypto from 'node:crypto';

// OAuth configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

/**
 * Generate a random state string for CSRF protection.
 */
export function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Build the Google OAuth authorization URL.
 */
export function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.OAUTH_CALLBACK_URL}/api/auth/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Build the GitHub OAuth authorization URL.
 */
export function buildGithubAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.OAUTH_CALLBACK_URL}/api/auth/oauth/github/callback`,
    scope: 'read:user user:email',
    state,
  });
  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange Google authorization code for tokens and fetch user profile.
 * @param {string} code - The authorization code from Google callback
 * @returns {Promise<{id: string, email: string, name: string, picture: string|null, accessToken: string, refreshToken: string|null, expiresAt: Date|null}>}
 */
export async function exchangeGoogleCode(code) {
  // Exchange code for tokens
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.OAUTH_CALLBACK_URL}/api/auth/oauth/google/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const tokens = await tokenResponse.json();

  // Fetch user profile
  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch Google user profile');
  }

  const user = await userResponse.json();

  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    picture: user.picture || null,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    expiresAt: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null,
  };
}

/**
 * Exchange GitHub authorization code for tokens and fetch user profile.
 * @param {string} code - The authorization code from GitHub callback
 * @returns {Promise<{id: string, email: string, name: string, avatarUrl: string|null, accessToken: string}>}
 */
export async function exchangeGithubCode(code) {
  // Exchange code for access token
  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.OAUTH_CALLBACK_URL}/api/auth/oauth/github/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`GitHub token exchange failed: ${error}`);
  }

  const tokens = await tokenResponse.json();

  if (tokens.error) {
    throw new Error(`GitHub OAuth error: ${tokens.error_description || tokens.error}`);
  }

  const accessToken = tokens.access_token;

  // Fetch user profile
  const userResponse = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch GitHub user profile');
  }

  const user = await userResponse.json();

  // GitHub user email might be private - fetch from emails endpoint
  let email = user.email;
  if (!email) {
    const emailsResponse = await fetch(GITHUB_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      // Find the primary verified email
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      const verifiedEmail = emails.find((e) => e.verified);
      email = primaryEmail?.email || verifiedEmail?.email || null;
    }
  }

  if (!email) {
    throw new Error('Could not get email from GitHub. Please ensure your email is verified and accessible.');
  }

  return {
    id: String(user.id),
    email,
    name: user.name || user.login || null,
    avatarUrl: user.avatar_url || null,
    accessToken,
  };
}

/**
 * Check if OAuth is configured for a provider.
 */
export function isOAuthConfigured(provider) {
  if (provider === 'google') {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === 'github') {
    return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  }
  return false;
}
